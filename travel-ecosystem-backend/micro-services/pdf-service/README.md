# PDF Itinerary Generator Service

## Overview
Microservice for generating beautiful, shareable PDF itineraries from trip plans. Includes maps, step-by-step instructions, costs, and emergency info.

## Tech Stack
- **Runtime**: Node.js 20+ (TypeScript)
- **PDF Generation**: Puppeteer (headless Chrome) or `react-pdf`
- **Queue**: BullMQ (async jobs)
- **Storage**: AWS S3 / MinIO (object storage)
- **Cache**: Redis
- **Templates**: Handlebars or React components

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   API       │──────▶│  BullMQ      │──────▶│   Worker    │
│   Gateway   │       │  Queue       │       │   Pool      │
└─────────────┘       └──────────────┘       └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │  Puppeteer   │
                                              │  + Template  │
                                              └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │  S3 / MinIO  │
                                              │  Storage     │
                                              └──────────────┘
```

## PDF Template Design

### Page 1: Cover
- Trip title
- Date range
- Destination with hero image
- Total duration, cost, number of stops
- QR code for offline Google Maps link

### Page 2-N: Itinerary
- Timeline view with numbered stops
- Map snapshot for each day/section
- Transport details per leg:
  - Mode icon (bus, walk, metro)
  - Duration, cost, departure/arrival times
  - Step-by-step instructions
  - Platform numbers, transfer info
- Attraction details:
  - Image
  - Address, opening hours
  - Estimated visit duration

### Last Page: Summary & Info
- Total cost breakdown (transport, admissions)
- Emergency contacts (embassy, local police, hospital)
- Offline maps instructions
- Weather forecast
- Currency exchange rates

## Implementation (Puppeteer)

```typescript
// src/services/pdf-generator.service.ts
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface PdfGenerationOptions {
  tripName: string;
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  legs: Array<{
    from: string;
    to: string;
    selectedMode: string;
    departure: string;
    arrival: string;
    cost: number;
    steps?: any[];
  }>;
  images: string[];
  notes?: string;
  format: 'A4' | 'Letter';
  locale: string;
}

export class PdfGeneratorService {
  private s3Client: S3Client;
  private bucket: string;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucket = process.env.S3_BUCKET || 'trip-itineraries';
  }
  
  async generatePDF(options: PdfGenerationOptions): Promise<{ pdfUrl: string; pages: number }> {
    // 1. Render HTML from template
    const html = await this.renderTemplate(options);
    
    // 2. Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });
    
    await browser.close();
    
    // 3. Upload to S3
    const key = `itineraries/${Date.now()}-${options.tripName.replace(/\s+/g, '-')}.pdf`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'private'
    }));
    
    // 4. Generate signed URL (24h expiry)
    const signedUrl = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 86400 }
    );
    
    // 5. Count pages (approximate)
    const pageCount = Math.ceil(pdfBuffer.length / 50000); // Rough estimate
    
    return {
      pdfUrl: signedUrl,
      pages: pageCount
    };
  }
  
  private async renderTemplate(options: PdfGenerationOptions): Promise<string> {
    const template = Handlebars.compile(HTML_TEMPLATE);
    
    const data = {
      tripName: options.tripName,
      generatedDate: new Date().toLocaleString(options.locale),
      legs: options.legs.map((leg, idx) => ({
        ...leg,
        legNumber: idx + 1,
        formattedDeparture: new Date(leg.departure).toLocaleTimeString(options.locale, {
          hour: '2-digit',
          minute: '2-digit'
        }),
        formattedArrival: new Date(leg.arrival).toLocaleTimeString(options.locale, {
          hour: '2-digit',
          minute: '2-digit'
        }),
        durationMinutes: Math.round(
          (new Date(leg.arrival).getTime() - new Date(leg.departure).getTime()) / 60000
        )
      })),
      totalCost: options.legs.reduce((sum, leg) => sum + leg.cost, 0).toFixed(2),
      totalDuration: options.legs.reduce((sum, leg) => {
        return sum + Math.round(
          (new Date(leg.arrival).getTime() - new Date(leg.departure).getTime()) / 60000
        );
      }, 0),
      images: options.images,
      notes: options.notes,
      mapUrl: await this.generateMapSnapshot(options.optimizedOrder)
    };
    
    return template(data);
  }
  
  private async generateMapSnapshot(order: Array<{ placeId: string; seq: number }>): Promise<string> {
    // Use Google Static Maps API or Mapbox Static Images
    const markers = order.map((p, idx) => `markers=color:blue|label:${idx + 1}|${p.placeId}`).join('&');
    return `https://maps.googleapis.com/maps/api/staticmap?${markers}&size=800x600&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  }
}
```

## HTML Template (Handlebars)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{tripName}} - Itinerary</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }
    
    .cover {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .cover h1 {
      font-size: 48pt;
      margin-bottom: 20px;
    }
    
    .cover .meta {
      font-size: 16pt;
      opacity: 0.9;
    }
    
    .leg {
      page-break-inside: avoid;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
      padding-left: 15px;
    }
    
    .leg-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .leg-number {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .leg-route {
      font-size: 14pt;
      font-weight: 600;
    }
    
    .transport {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 8px;
      margin: 10px 0;
    }
    
    .transport-mode {
      display: inline-block;
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 4px;
      font-size: 10pt;
      text-transform: uppercase;
      font-weight: bold;
    }
    
    .steps {
      margin-top: 10px;
      padding-left: 20px;
    }
    
    .step {
      margin: 5px 0;
      font-size: 10pt;
      color: #666;
    }
    
    .map {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .summary {
      page-break-before: always;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .summary h2 {
      color: #667eea;
      margin-bottom: 15px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .summary-item {
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    
    .summary-item strong {
      display: block;
      color: #667eea;
      font-size: 12pt;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <h1>{{tripName}}</h1>
    <div class="meta">
      <p>Generated on {{generatedDate}}</p>
      <p>{{legs.length}} legs • {{totalDuration}} minutes • ${{totalCost}}</p>
    </div>
  </div>
  
  <!-- Itinerary Pages -->
  {{#each legs}}
  <div class="leg">
    <div class="leg-header">
      <div class="leg-number">{{legNumber}}</div>
      <div class="leg-route">{{from}} → {{to}}</div>
    </div>
    
    <div class="transport">
      <span class="transport-mode">{{selectedMode}}</span>
      <span>{{formattedDeparture}} - {{formattedArrival}}</span>
      <span>({{durationMinutes}} min, ${{cost}})</span>
    </div>
    
    {{#if steps}}
    <div class="steps">
      <strong>Detailed Steps:</strong>
      {{#each steps}}
      <div class="step">{{@index}}. {{type}}: {{instructions}}</div>
      {{/each}}
    </div>
    {{/if}}
  </div>
  {{/each}}
  
  <!-- Map -->
  <img src="{{mapUrl}}" class="map" alt="Route map" />
  
  <!-- Summary Page -->
  <div class="summary">
    <h2>Trip Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <strong>Total Cost</strong>
        ${{totalCost}}
      </div>
      <div class="summary-item">
        <strong>Total Duration</strong>
        {{totalDuration}} minutes
      </div>
      <div class="summary-item">
        <strong>Number of Legs</strong>
        {{legs.length}}
      </div>
      <div class="summary-item">
        <strong>Transport Modes</strong>
        Mixed
      </div>
    </div>
    
    {{#if notes}}
    <div style="margin-top: 20px;">
      <strong>Notes:</strong>
      <p>{{notes}}</p>
    </div>
    {{/if}}
    
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
      <h3>Emergency Contacts</h3>
      <p><strong>Emergency Services:</strong> 911 (US) / 112 (EU) / Local equivalent</p>
      <p><strong>Lost & Found:</strong> Contact local transit authority</p>
    </div>
  </div>
</body>
</html>
```

## API Routes

```typescript
// src/routes/pdf.routes.ts
import { FastifyInstance } from 'fastify';
import { pdfQueue } from '../queues';
import { PdfGeneratorService } from '../services/pdf-generator.service';

export async function registerPdfRoutes(fastify: FastifyInstance) {
  const pdfService = new PdfGeneratorService();
  
  // Generate PDF (async)
  fastify.post('/api/generate-pdf', async (request, reply) => {
    const payload = request.body as PdfGenerationOptions;
    
    // Add to queue
    const job = await pdfQueue.add('generate-pdf', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    return reply.send({
      success: true,
      jobId: job.id,
      message: 'PDF generation started',
      statusUrl: `/api/pdf-status/${job.id}`
    });
  });
  
  // Check status
  fastify.get('/api/pdf-status/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await pdfQueue.getJob(jobId);
    
    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    const state = await job.getState();
    
    if (state === 'completed') {
      return reply.send({
        status: 'completed',
        result: job.returnvalue
      });
    } else if (state === 'failed') {
      return reply.send({
        status: 'failed',
        error: job.failedReason
      });
    } else {
      return reply.send({
        status: state,
        progress: job.progress || 0
      });
    }
  });
}

// Worker
import { Worker } from 'bullmq';

const worker = new Worker('generate-pdf', async (job) => {
  const pdfService = new PdfGeneratorService();
  
  job.updateProgress(20);
  
  const result = await pdfService.generatePDF(job.data);
  
  job.updateProgress(100);
  
  return result;
}, {
  connection: redisConnection,
  concurrency: 5 // Max 5 concurrent PDF generations
});
```

## Docker Compose

```yaml
version: '3.8'
services:
  pdf-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3009:3009"
    environment:
      REDIS_URL: redis://redis:6379
      AWS_REGION: us-east-1
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      S3_BUCKET: trip-itineraries
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
    depends_on:
      - redis
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## Dockerfile

```dockerfile
FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3009

CMD ["node", "dist/index.js"]
```

## Performance & Scaling

- **Concurrency**: 5 workers per instance
- **Generation time**: 2-5 seconds per PDF
- **Scaling**: Horizontal (add more workers)
- **Caching**: Cache identical requests for 5 minutes
- **Rate limiting**: 10 requests/minute per user

## Testing

```typescript
describe('PDF Generator', () => {
  it('should generate PDF in <5s', async () => {
    const start = Date.now();
    const result = await pdfService.generatePDF(samplePayload);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000);
    expect(result.pdfUrl).toMatch(/^https:\/\//);
  });
});
```

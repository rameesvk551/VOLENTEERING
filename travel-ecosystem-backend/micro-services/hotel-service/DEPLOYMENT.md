# Hotel Discovery & Booking Service - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software
- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Kafka**: 3.x (optional, can be disabled)
- **PostgreSQL**: 14.x (production)
- **Redis**: 7.x (production)

### Optional
- **Kubernetes**: 1.25+ (for K8s deployment)
- **Nginx**: For reverse proxy and load balancing

---

## 2. Local Development

### Backend Service

#### Step 1: Install Dependencies
```bash
cd travel-ecosystem-backend/micro-services/hotel-service
npm install
```

#### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=4005
NODE_ENV=development
KAFKA_ENABLED=false
RAPIDAPI_KEY=your_key_here
JWT_SECRET=volenteering-shared-secret
```

#### Step 3: Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:4005`

#### Step 4: Test Health Endpoint
```bash
curl http://localhost:4005/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "hotel-discovery-booking-service",
  "timestamp": "2024-12-13T10:00:00.000Z",
  "circuitBreaker": "CLOSED"
}
```

### Frontend MFE

#### Step 1: Install Dependencies
```bash
cd travel-ecosystem/apps/hotel-booking
npm install
```

#### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
```

#### Step 3: Start Development Server
```bash
npm run dev
```

MFE will start on `http://localhost:1007`

### API Gateway

#### Step 1: Configure Gateway
Edit `travel-ecosystem-backend/api-gateway/.env`:
```env
HOTEL_SERVICE_URL=http://localhost:4005
```

#### Step 2: Start Gateway
```bash
cd travel-ecosystem-backend/api-gateway
npm run dev
```

Gateway will start on `http://localhost:4000`

### Integration with Shell

#### Step 1: Update Shell Config
Edit `travel-ecosystem/shell/vite.config.ts`:
```typescript
remotes: {
  hotelBooking: 'http://localhost:1007/assets/remoteEntry.js'
}
```

#### Step 2: Add Route to Shell
Edit `travel-ecosystem/shell/src/App.tsx`:
```typescript
import HotelBookingApp from 'hotelBooking/App';

<Route path="/hotels/*" element={<HotelBookingApp />} />
```

#### Step 3: Start Shell
```bash
cd travel-ecosystem/shell
npm run dev
```

---

## 3. Docker Deployment

### Backend Service Dockerfile

Create `travel-ecosystem-backend/micro-services/hotel-service/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]
```

### Docker Compose

Create `travel-ecosystem-backend/docker-compose.hotel.yml`:
```yaml
version: '3.8'

services:
  hotel-service:
    build:
      context: ./micro-services/hotel-service
      dockerfile: Dockerfile
    ports:
      - "4005:4005"
    environment:
      PORT: 4005
      NODE_ENV: production
      DATABASE_URL: postgresql://user:password@postgres:5432/hotel_db
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:9092
      KAFKA_ENABLED: "true"
      JWT_SECRET: ${JWT_SECRET}
      RAPIDAPI_KEY: ${RAPIDAPI_KEY}
    depends_on:
      - postgres
      - redis
      - kafka
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4005/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: hotel_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

volumes:
  postgres_data:
  redis_data:
```

### Build and Run
```bash
cd travel-ecosystem-backend
docker-compose -f docker-compose.hotel.yml up -d
```

### View Logs
```bash
docker-compose -f docker-compose.hotel.yml logs -f hotel-service
```

---

## 4. Production Deployment

### Cloud Deployment (AWS Example)

#### Architecture
```
Internet
    ↓
CloudFront (CDN for MFE)
    ↓
ALB (Application Load Balancer)
    ↓
ECS Tasks (Hotel Service)
    ↓
RDS (PostgreSQL) + ElastiCache (Redis) + MSK (Kafka)
```

#### Step 1: Build Docker Image
```bash
cd travel-ecosystem-backend/micro-services/hotel-service
docker build -t hotel-service:latest .
```

#### Step 2: Tag and Push to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_REPO

docker tag hotel-service:latest YOUR_ECR_REPO/hotel-service:latest
docker push YOUR_ECR_REPO/hotel-service:latest
```

#### Step 3: ECS Task Definition
```json
{
  "family": "hotel-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "hotel-service",
      "image": "YOUR_ECR_REPO/hotel-service:latest",
      "portMappings": [
        {
          "containerPort": 4005,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "4005" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:hotel-db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:jwt-secret"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4005/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hotel-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Kubernetes Deployment

#### Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hotel-service
  namespace: travel-ecosystem
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hotel-service
  template:
    metadata:
      labels:
        app: hotel-service
        version: v1
    spec:
      containers:
      - name: hotel-service
        image: YOUR_REGISTRY/hotel-service:latest
        ports:
        - containerPort: 4005
          name: http
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "4005"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hotel-db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        - name: KAFKA_BROKERS
          value: kafka.kafka.svc.cluster.local:9092
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4005
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 4005
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: hotel-service
  namespace: travel-ecosystem
spec:
  selector:
    app: hotel-service
  ports:
  - protocol: TCP
    port: 4005
    targetPort: 4005
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hotel-service-hpa
  namespace: travel-ecosystem
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hotel-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Apply Configuration
```bash
kubectl apply -f k8s/hotel-service-deployment.yaml
kubectl apply -f k8s/hotel-service-service.yaml
kubectl apply -f k8s/hotel-service-hpa.yaml
```

---

## 5. Environment Configuration

### Production Environment Variables
```env
# Server
PORT=4005
NODE_ENV=production
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@host:5432/hotel_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://host:6379
REDIS_TTL=300

# Kafka
KAFKA_ENABLED=true
KAFKA_BROKERS=kafka-1:9092,kafka-2:9092,kafka-3:9092
KAFKA_CLIENT_ID=hotel-service
KAFKA_GROUP_ID=hotel-service-consumer
RESERVATION_CREATED_TOPIC=hotel.reservation.created
RESERVATION_CONFIRMED_TOPIC=hotel.reservation.confirmed
RESERVATION_CANCELLED_TOPIC=hotel.reservation.cancelled
PAYMENT_TOPIC=payment.requests

# External API
RAPIDAPI_KEY=your_production_key

# Security
JWT_SECRET=your_super_secret_production_key_min_32_chars

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info
```

---

## 6. Database Setup

### PostgreSQL Schema Migration

Create `migrations/001_initial_schema.sql`:
```sql
-- Hotels table
CREATE TABLE hotels (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  star_rating INTEGER,
  review_count INTEGER,
  price_amount DECIMAL(10, 2),
  price_currency VARCHAR(3),
  source VARCHAR(20) NOT NULL,
  external_booking_url VARCHAR(500),
  availability BOOLEAN DEFAULT TRUE,
  distance_from_center DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
  id VARCHAR(255) PRIMARY KEY,
  hotel_id VARCHAR(255) REFERENCES hotels(id),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  price_amount DECIMAL(10, 2) NOT NULL,
  price_currency VARCHAR(3) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  total_rooms INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  hotel_id VARCHAR(255) REFERENCES hotels(id),
  room_id VARCHAR(255) REFERENCES rooms(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_country ON hotels(country);
CREATE INDEX idx_hotels_source ON hotels(source);
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
```

### Run Migration
```bash
psql -h localhost -U user -d hotel_db -f migrations/001_initial_schema.sql
```

---

## 7. Monitoring & Logging

### Health Checks
```bash
# Check service health
curl http://your-domain:4005/health

# Expected response
{
  "status": "ok",
  "service": "hotel-discovery-booking-service",
  "timestamp": "2024-12-13T10:00:00.000Z",
  "circuitBreaker": "CLOSED"
}
```

### Logging
Use structured logging in production:
```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring Metrics
- Request rate
- Response time
- Error rate
- Circuit breaker state
- Cache hit ratio
- Database connection pool size

---

## 8. Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs hotel-service

# Common issues:
# 1. Port already in use
lsof -i :4005

# 2. Environment variables missing
docker exec hotel-service printenv

# 3. Database connection failed
docker exec hotel-service pg_isready -h postgres
```

### High Memory Usage
```bash
# Check memory usage
docker stats hotel-service

# Solution: Increase container memory limit
docker update --memory 2g hotel-service
```

### Slow API Responses
```bash
# Check Redis cache
redis-cli ping

# Check database queries
# Enable query logging in PostgreSQL

# Check external API circuit breaker
curl http://localhost:4005/health
# Look at "circuitBreaker" status
```

---

## Summary

This deployment guide covers:
1. ✅ Local development setup
2. ✅ Docker containerization
3. ✅ Production deployment (AWS/K8s)
4. ✅ Environment configuration
5. ✅ Database setup and migrations
6. ✅ Monitoring and logging
7. ✅ Troubleshooting common issues

For questions or issues, refer to the API documentation and architecture guide.

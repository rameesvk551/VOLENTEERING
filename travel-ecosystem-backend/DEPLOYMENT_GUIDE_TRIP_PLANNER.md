# Trip Planner - Complete Deployment Guide

## Overview
Full deployment instructions for the mobile-first trip planning system with route optimization, multimodal transport, and PDF generation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway (Kong)                       │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ├──▶ Discovery Engine (Port 3001)
        │   └── /api/v1/attractions, /api/v1/optimize-route
        │
        ├──▶ Route Optimizer (Port 3007)
        │   └── /api/optimize-route, /api/optimize/:jobId/status
        │
        ├──▶ Transportation Service (Port 3008)
        │   └── /transport/multi-modal-route, /transport/nearby-stops
        │
        └──▶ PDF Service (Port 3009)
            └── /api/generate-pdf, /api/pdf-status/:jobId

        Shared Infrastructure:
        - PostgreSQL (PostGIS) - GTFS data
        - Redis - Caching & queues
        - S3/MinIO - PDF storage
        - Kafka - Event streaming (optional)
```

## Prerequisites

- **Docker** 24+
- **Kubernetes** 1.28+ (for production)
- **Node.js** 20+ (for local dev)
- **PostgreSQL** 15+ with PostGIS
- **Redis** 7+
- **AWS Account** (or MinIO for object storage)

## Quick Start (Development)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/trip-planner.git
cd trip-planner

# Install frontend dependencies
cd travel-ecosystem/apps/trip-planner
npm install

# Install backend dependencies
cd ../../../travel-ecosystem-backend
npm install

# Install micro-services
cd micro-services/route-optimizer
npm install

cd ../transportation-service
npm install

cd ../pdf-service
npm install
```

### 2. Environment Variables

Create `.env` files for each service:

**Discovery Engine** (`travel-ecosystem-backend/micro-services/discovery-engine/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/discovery
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
ROUTE_OPTIMIZER_URL=http://localhost:3007
TRANSPORT_SERVICE_URL=http://localhost:3008
```

**Route Optimizer** (`travel-ecosystem-backend/micro-services/route-optimizer/.env`):
```env
PORT=3007
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

**Transportation Service** (`travel-ecosystem-backend/micro-services/transportation-service/.env`):
```env
PORT=3008
DATABASE_URL=postgresql://user:password@localhost:5432/gtfs
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=your_key_here
GTFS_FEED_URLS=["https://example.com/gtfs.zip"]
```

**PDF Service** (`travel-ecosystem-backend/micro-services/pdf-service/.env`):
```env
PORT=3009
REDIS_URL=redis://localhost:6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=trip-itineraries
GOOGLE_MAPS_API_KEY=your_key_here
```

**Frontend** (`travel-ecosystem/apps/trip-planner/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_TRANSPORT_API_URL=http://localhost:3008
VITE_OPTIMIZER_API_URL=http://localhost:3007
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL with PostGIS
docker run -d \
  --name gtfs-postgres \
  -e POSTGRES_DB=gtfs \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgis/postgis:15-3.3

# Start Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Start MongoDB (for Discovery Engine)
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:7
```

### 4. Initialize Databases

```bash
# Create GTFS tables
cd travel-ecosystem-backend/micro-services/transportation-service
npm run db:migrate

# Import sample GTFS feed
npm run gtfs:import -- --feed-url="https://example.com/gtfs.zip"
```

### 5. Start Services

```bash
# Terminal 1: Discovery Engine
cd travel-ecosystem-backend/micro-services/discovery-engine
npm run dev

# Terminal 2: Route Optimizer
cd travel-ecosystem-backend/micro-services/route-optimizer
npm run dev

# Terminal 3: Transportation Service
cd travel-ecosystem-backend/micro-services/transportation-service
npm run dev

# Terminal 4: PDF Service
cd travel-ecosystem-backend/micro-services/pdf-service
npm run dev

# Terminal 5: Frontend
cd travel-ecosystem/apps/trip-planner
npm run dev
```

### 6. Access Application

- **Frontend**: http://localhost:5173
- **Discovery API**: http://localhost:3001
- **Route Optimizer**: http://localhost:3007
- **Transport API**: http://localhost:3008
- **PDF API**: http://localhost:3009

## Production Deployment (Kubernetes)

### 1. Build Docker Images

```bash
# Build all images
docker build -t trip-planner-frontend:latest ./travel-ecosystem/apps/trip-planner
docker build -t discovery-engine:latest ./travel-ecosystem-backend/micro-services/discovery-engine
docker build -t route-optimizer:latest ./travel-ecosystem-backend/micro-services/route-optimizer
docker build -t transportation-service:latest ./travel-ecosystem-backend/micro-services/transportation-service
docker build -t pdf-service:latest ./travel-ecosystem-backend/micro-services/pdf-service

# Tag for registry
docker tag trip-planner-frontend:latest your-registry.com/trip-planner-frontend:latest
# ... repeat for all services

# Push to registry
docker push your-registry.com/trip-planner-frontend:latest
# ... repeat for all services
```

### 2. Deploy to Kubernetes

**Namespace**:
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: trip-planner
```

**ConfigMap**:
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: trip-planner-config
  namespace: trip-planner
data:
  DISCOVERY_ENGINE_URL: "http://discovery-engine:3001"
  ROUTE_OPTIMIZER_URL: "http://route-optimizer:3007"
  TRANSPORT_SERVICE_URL: "http://transportation-service:3008"
  PDF_SERVICE_URL: "http://pdf-service:3009"
```

**Secrets**:
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: trip-planner-secrets
  namespace: trip-planner
type: Opaque
stringData:
  GOOGLE_MAPS_API_KEY: "your_key"
  AWS_ACCESS_KEY_ID: "your_key"
  AWS_SECRET_ACCESS_KEY: "your_secret"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/gtfs"
  REDIS_URL: "redis://redis:6379"
```

**Deployments** (example for Discovery Engine):
```yaml
# k8s/discovery-engine-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: discovery-engine
  namespace: trip-planner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: discovery-engine
  template:
    metadata:
      labels:
        app: discovery-engine
    spec:
      containers:
      - name: discovery-engine
        image: your-registry.com/discovery-engine:latest
        ports:
        - containerPort: 3001
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        envFrom:
        - configMapRef:
            name: trip-planner-config
        - secretRef:
            name: trip-planner-secrets
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: discovery-engine
  namespace: trip-planner
spec:
  selector:
    app: discovery-engine
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: discovery-engine-hpa
  namespace: trip-planner
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: discovery-engine
  minReplicas: 2
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

### 3. Apply Kubernetes Manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/discovery-engine-deployment.yaml
kubectl apply -f k8s/route-optimizer-deployment.yaml
kubectl apply -f k8s/transportation-service-deployment.yaml
kubectl apply -f k8s/pdf-service-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Ingress (NGINX)

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: trip-planner-ingress
  namespace: trip-planner
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.tripplanner.com
    - app.tripplanner.com
    secretName: tripplanner-tls
  rules:
  - host: api.tripplanner.com
    http:
      paths:
      - path: /api/v1
        pathType: Prefix
        backend:
          service:
            name: discovery-engine
            port:
              number: 3001
      - path: /api/optimize
        pathType: Prefix
        backend:
          service:
            name: route-optimizer
            port:
              number: 3007
      - path: /transport
        pathType: Prefix
        backend:
          service:
            name: transportation-service
            port:
              number: 3008
      - path: /api/generate-pdf
        pathType: Prefix
        backend:
          service:
            name: pdf-service
            port:
              number: 3009
  - host: app.tripplanner.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## Monitoring & Observability

### 1. Prometheus Metrics

Add Prometheus middleware to all services:

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

fastify.addHook('onResponse', (request, reply, done) => {
  httpRequestDuration.observe({
    method: request.method,
    route: request.routerPath,
    status_code: reply.statusCode
  }, reply.getResponseTime() / 1000);
  done();
});

fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', register.contentType);
  return register.metrics();
});
```

### 2. Grafana Dashboards

Import dashboards:
- Node.js application metrics
- PostgreSQL metrics
- Redis metrics
- Business metrics (routes optimized, PDFs generated)

### 3. Logging (ELK Stack)

```yaml
# k8s/fluentd-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch.logging.svc.cluster.local"
        - name: FLUENT_ELASTICSEARCH_PORT
          value: "9200"
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/discovery-engine:${{ github.sha }} ./travel-ecosystem-backend/micro-services/discovery-engine
        docker build -t ${{ secrets.REGISTRY }}/route-optimizer:${{ github.sha }} ./travel-ecosystem-backend/micro-services/route-optimizer
        # ... other services
    
    - name: Push images
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker push ${{ secrets.REGISTRY }}/discovery-engine:${{ github.sha }}
        # ... other services
    
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/discovery-engine-deployment.yaml
          k8s/route-optimizer-deployment.yaml
          k8s/transportation-service-deployment.yaml
          k8s/pdf-service-deployment.yaml
        images: |
          ${{ secrets.REGISTRY }}/discovery-engine:${{ github.sha }}
          ${{ secrets.REGISTRY }}/route-optimizer:${{ github.sha }}
        kubectl-version: 'latest'
```

## Backup & Disaster Recovery

### Database Backups
```bash
# Daily PostgreSQL backup
kubectl create cronjob postgres-backup \
  --image=postgres:15 \
  --schedule="0 2 * * *" \
  --restart=OnFailure \
  -- /bin/sh -c "pg_dump -h postgres -U user gtfs | gzip > /backups/gtfs-$(date +%Y%m%d).sql.gz"
```

### Redis Persistence
Enable AOF (Append-Only File) in Redis config.

## Cost Optimization

- **Use Spot Instances** for worker pods (PDF generation, route optimization)
- **Autoscaling**: HPA + Cluster Autoscaler
- **CDN**: CloudFront for frontend static assets
- **Image Optimization**: Use WebP/AVIF
- **API Caching**: Aggressive Redis caching for GTFS data

## Security Checklist

- [ ] API rate limiting enabled
- [ ] JWT authentication implemented
- [ ] HTTPS enforced (TLS 1.3)
- [ ] Secrets managed via Kubernetes Secrets or AWS Secrets Manager
- [ ] Network policies configured
- [ ] Pod security policies enabled
- [ ] Regular security scans (Trivy, Snyk)
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)

## Troubleshooting

### Service not responding
```bash
kubectl logs -n trip-planner deployment/discovery-engine --tail=100
kubectl describe pod -n trip-planner <pod-name>
```

### Database connection issues
```bash
kubectl exec -it -n trip-planner postgres-0 -- psql -U user -d gtfs
```

### Redis issues
```bash
kubectl exec -it -n trip-planner redis-0 -- redis-cli PING
```

## Performance Tuning

1. **PostgreSQL**: Increase `shared_buffers`, enable query caching
2. **Redis**: Increase `maxmemory`, use eviction policy `allkeys-lru`
3. **Node.js**: Use `--max-old-space-size=4096` for memory-intensive tasks
4. **Kubernetes**: Set appropriate resource requests/limits

## Support & Maintenance

- **Runbooks**: Create runbooks for common issues
- **On-call rotation**: PagerDuty integration
- **Health checks**: Comprehensive liveness/readiness probes
- **Alerting**: Alert on 5xx errors, high latency, pod restarts

# Travel Ecosystem - Microservices Backend

Highly scalable, advanced microservices architecture for the Travel Ecosystem.

## Services

- **discovery-engine** (port 4000) - AI-powered travel discovery using Neo4j knowledge graph
- **visa-explore** (port 4001) - Visa information and requirements service
- **blog** (port 4002) - Travel blog content service (MongoDB)
- **volenteering** (port 4003) - Volunteering opportunities service

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local dev without Docker)

### Run All Services with Docker Compose

```bash
docker-compose up --build
```

Services will be available at:
- http://localhost:4000 - discovery-engine
- http://localhost:4001 - visa-explore
- http://localhost:4002 - blog
- http://localhost:4003 - volenteering

Database UIs:
- http://localhost:7474 - Neo4j Browser (user: neo4j, pass: password)
- MongoDB on localhost:27017

### Run Individual Service (Local Dev)

```bash
cd services/discovery-engine
npm install
cp .env.example .env
npm run dev
```

## Architecture

- **TypeScript** for type safety
- **Express** for HTTP APIs
- **Neo4j** for knowledge graph (discovery-engine)
- **MongoDB** for document storage (blog)
- **Docker** for containerization
- **Docker Compose** for local orchestration

## Production Deployment

For production:
- Use Kubernetes manifests (add to `k8s/` folder)
- Configure CI/CD pipelines (GitHub Actions, GitLab CI)
- Add horizontal pod autoscaling
- Implement service mesh (Istio/Linkerd)
- Add API Gateway (Kong/Traefik)
- Configure observability (Prometheus, Grafana, Jaeger)

## Next Steps

1. Add business logic to each service
2. Implement inter-service communication (REST/gRPC/message queue)
3. Add authentication/authorization (JWT, OAuth)
4. Configure rate limiting and caching (Redis)
5. Write tests (Jest, Supertest)
6. Set up CI/CD
7. Create Kubernetes manifests

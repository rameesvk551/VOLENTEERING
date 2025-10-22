# AI-Powered Travel Discovery & Trip Planning Ecosystem

An intelligent, self-improving AI-driven travel discovery and recommendation platform that automatically finds, extracts, understands, and summarizes the best places, festivals, attractions, and events for any city and time period.

## Features

### 🤖 AI-Powered Discovery Engine
- **Natural Language Queries**: Ask questions like "Delhi in October" or "Best food festivals in Paris"
- **Semantic Search**: Advanced vector-based search using OpenAI embeddings and Weaviate
- **LangChain Pipeline**: Entity extraction, retrieval, summarization, and ranking
- **LangGraph Knowledge**: Contextual recommendations through graph-based relationships
- **Real-time Processing**: Sub-3-second query responses with 90% cache hit rate

### 🎨 Advanced UI/UX Design
- **Glassmorphism Design**: Modern, elegant interface with backdrop blur effects
- **Framer Motion Animations**: Smooth, engaging transitions and interactions
- **Dark Mode Support**: Complete dark theme with automatic detection
- **Responsive Layout**: Mobile-first design optimized for all devices
- **Interactive Components**: Draggable cards, animated search, real-time feedback

## Quick Start

Visit the complete documentation at [docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md](docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md)

### Prerequisites

- Node.js >= 18.0.0
- Docker & Docker Compose
- OpenAI API Key

### Installation

1. **Install dependencies**:
```bash
# Frontend
cd apps/trip-planner && npm install

# Backend
cd services/discovery-engine && npm install
```

2. **Setup environment variables**:
```bash
# Backend
cd services/discovery-engine
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Frontend
cd apps/trip-planner
cp .env.example .env
```

3. **Start databases**:
```bash
docker-compose up -d
```

4. **Run the application**:
```bash
# Terminal 1 - Backend
cd services/discovery-engine && npm run dev

# Terminal 2 - Frontend
cd apps/trip-planner && npm run dev
```

5. **Access**:
- Frontend: http://localhost:5004
- AI Discovery: http://localhost:5004/ai-discovery
- Backend API: http://localhost:3000

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Fastify, LangChain, LangGraph
- **AI**: OpenAI GPT-4o-mini, text-embedding-3-small
- **Databases**: MongoDB, Weaviate (vectors), Redis (cache)

## License

MIT

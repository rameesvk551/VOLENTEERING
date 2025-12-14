#!/bin/bash

echo "🚀 Starting Route Optimizer Microservice..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, copying from .env.example"
    cp .env.example .env
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the service
echo "🎯 Starting service on port 3007..."
npm run dev

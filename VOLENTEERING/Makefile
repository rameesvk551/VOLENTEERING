# Makefile for Blog Microservices
# Purpose: Simplify common Docker and development commands
# Architecture: Convenience commands for docker-compose operations

.PHONY: help up down restart logs clean build test

# Default target
help:
	@echo "Blog Microservices - Available Commands:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make logs-be     - View backend logs"
	@echo "  make logs-fe     - View frontend logs"
	@echo "  make logs-db     - View database logs"
	@echo "  make build       - Build all images"
	@echo "  make clean       - Remove containers, volumes, and images"
	@echo "  make ps          - List running containers"
	@echo "  make backend     - Start only backend services"
	@echo "  make frontend    - Start only frontend"
	@echo "  make test-be     - Run backend tests"
	@echo "  make test-fe     - Run frontend tests"

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs from all services
logs:
	docker-compose logs -f

# View backend logs
logs-be:
	docker-compose logs -f blog-backend

# View frontend logs
logs-fe:
	docker-compose logs -f blog-frontend

# View database logs
logs-db:
	docker-compose logs -f mongodb

# Build all images
build:
	docker-compose build

# Remove containers, volumes, and images
clean:
	docker-compose down -v --rmi all

# List running containers
ps:
	docker-compose ps

# Start only backend services (backend + database)
backend:
	docker-compose up -d mongodb blog-backend

# Start only frontend
frontend:
	docker-compose up -d blog-frontend

# Run backend tests
test-be:
	cd blog-backend && npm test

# Run frontend tests
test-fe:
	cd blog-frontend && npm test

# Install dependencies for both services
install:
	cd blog-backend && npm install
	cd blog-frontend && npm install

# Development mode (without Docker)
dev-be:
	cd blog-backend && npm run dev

dev-fe:
	cd blog-frontend && npm run dev

.PHONY: help install setup start stop restart clean test crawl stats

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "${GREEN}Installing dependencies...${NC}"
	npm install
	npx playwright install chromium
	@echo "${GREEN}✓ Dependencies installed${NC}"

setup: install ## Complete setup (install + configure)
	@echo "${GREEN}Running setup...${NC}"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${YELLOW}⚠ .env file created. Please edit it with your API keys.${NC}"; \
	fi
	@echo "${GREEN}✓ Setup complete${NC}"

services-start: ## Start Docker services (MongoDB, Redis, Weaviate)
	@echo "${GREEN}Starting services...${NC}"
	docker-compose up -d
	@echo "${GREEN}Waiting for services to be ready...${NC}"
	@sleep 5
	@echo "${GREEN}✓ Services started${NC}"

services-stop: ## Stop Docker services
	@echo "${GREEN}Stopping services...${NC}"
	docker-compose down
	@echo "${GREEN}✓ Services stopped${NC}"

services-restart: services-stop services-start ## Restart Docker services

services-status: ## Show status of Docker services
	@docker-compose ps

services-logs: ## Show logs from Docker services
	@docker-compose logs -f

dev: ## Start development server
	@echo "${GREEN}Starting development server...${NC}"
	npm run dev

build: ## Build the project
	@echo "${GREEN}Building project...${NC}"
	npm run build
	@echo "${GREEN}✓ Build complete${NC}"

start: build ## Start production server
	@echo "${GREEN}Starting production server...${NC}"
	npm start

worker-crawler: ## Start crawler worker
	@echo "${GREEN}Starting crawler worker...${NC}"
	npm run worker:crawler

worker-etl: ## Start ETL worker
	@echo "${GREEN}Starting ETL worker...${NC}"
	npm run worker:etl

test: ## Run tests
	@echo "${GREEN}Running tests...${NC}"
	npm test

test-crawl: ## Test crawler on Delhi
	@echo "${GREEN}Testing crawler...${NC}"
	npm run crawl:test -- -s timeout -c "Delhi" -C "India"

crawl-delhi: ## Crawl Delhi (example)
	@echo "${GREEN}Crawling Delhi...${NC}"
	npm run crawl -- -c "Delhi" -C "India"

crawl-batch: ## Batch crawl cities from cities.example.json
	@echo "${GREEN}Running batch crawl...${NC}"
	npm run cli -- crawl-batch -f cities.example.json

stats: ## Show crawler statistics
	@echo "${GREEN}Fetching statistics...${NC}"
	npm run crawl:stats

clear-cache: ## Clear crawler cache
	@echo "${GREEN}Clearing cache...${NC}"
	npm run cli -- clear-cache --all
	@echo "${GREEN}✓ Cache cleared${NC}"

lint: ## Run linter
	@echo "${GREEN}Running linter...${NC}"
	npm run lint

type-check: ## Run TypeScript type checking
	@echo "${GREEN}Running type check...${NC}"
	npm run type-check

clean: ## Clean build artifacts and node_modules
	@echo "${GREEN}Cleaning...${NC}"
	rm -rf dist
	rm -rf node_modules
	rm -rf .playwright
	@echo "${GREEN}✓ Cleaned${NC}"

clean-data: ## WARNING: Remove all Docker volumes (deletes all data)
	@echo "${YELLOW}⚠ This will delete all data in Docker volumes!${NC}"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose down -v
	@echo "${GREEN}✓ Data cleaned${NC}"

logs: ## Show application logs
	@tail -f logs/*.log 2>/dev/null || echo "No logs found"

health: ## Check health of services
	@echo "${GREEN}Checking health...${NC}"
	@echo "MongoDB:"
	@docker exec discovery-mongodb mongosh --eval "db.adminCommand('ping')" --quiet || echo "  ❌ Not running"
	@echo "Redis:"
	@docker exec discovery-redis redis-cli ping || echo "  ❌ Not running"
	@echo "Weaviate:"
	@curl -s http://localhost:8080/v1/.well-known/ready | grep -q "true" && echo "  ✓ Ready" || echo "  ❌ Not ready"
	@echo "API:"
	@curl -s http://localhost:3000/api/v1/health | grep -q "ok" && echo "  ✓ OK" || echo "  ⚠ Not running"

db-connect: ## Connect to MongoDB shell
	@docker exec -it discovery-mongodb mongosh travel_discovery

redis-cli: ## Connect to Redis CLI
	@docker exec -it discovery-redis redis-cli

production-start: ## Start all services for production
	@echo "${GREEN}Starting production environment...${NC}"
	@make services-start
	@sleep 5
	@make build
	@echo "${GREEN}Starting API server...${NC}"
	@npm start &
	@echo "${GREEN}Starting workers...${NC}"
	@npm run worker:crawler &
	@npm run worker:etl &
	@echo "${GREEN}✓ Production environment started${NC}"
	@echo "${GREEN}API: http://localhost:3000${NC}"

production-stop: ## Stop all production services
	@echo "${GREEN}Stopping production environment...${NC}"
	@pkill -f "node dist/index.js" || true
	@pkill -f "tsx src/workers" || true
	@make services-stop
	@echo "${GREEN}✓ Production environment stopped${NC}"

backup: ## Backup MongoDB data
	@echo "${GREEN}Creating backup...${NC}"
	@mkdir -p backups
	@docker exec discovery-mongodb mongodump --db=travel_discovery --out=/tmp/backup
	@docker cp discovery-mongodb:/tmp/backup ./backups/backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "${GREEN}✓ Backup created in ./backups/${NC}"

restore: ## Restore MongoDB from latest backup
	@echo "${GREEN}Restoring from backup...${NC}"
	@LATEST=$$(ls -t backups/ | head -1); \
	docker cp backups/$$LATEST discovery-mongodb:/tmp/restore; \
	docker exec discovery-mongodb mongorestore --db=travel_discovery /tmp/restore/travel_discovery
	@echo "${GREEN}✓ Restored from backup${NC}"

quick-start: setup services-start ## Quick start: setup + start services
	@echo "${GREEN}✓ Quick start complete!${NC}"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit .env file with your API keys"
	@echo "  2. Test: make test-crawl"
	@echo "  3. Crawl: make crawl-delhi"
	@echo "  4. Start API: make dev"

demo: services-start ## Run a full demo
	@echo "${GREEN}Running demo...${NC}"
	@sleep 5
	@echo "${GREEN}1. Testing crawler...${NC}"
	@make test-crawl
	@echo ""
	@echo "${GREEN}2. Crawling Delhi...${NC}"
	@make crawl-delhi
	@echo ""
	@echo "${GREEN}3. Showing statistics...${NC}"
	@make stats
	@echo ""
	@echo "${GREEN}✓ Demo complete!${NC}"

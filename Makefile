# =============================================================================
# Insight Contract Intelligence Platform - Makefile
# =============================================================================
# This Makefile provides convenient commands for managing the Insight
# development environment.
#
# Usage: make <target>
# Run 'make help' to see available commands.
#
# For Windows users:
#   - Install Make via: choco install make
#   - Or use Git Bash / WSL
# =============================================================================

# Default shell (use bash for cross-platform compatibility)
SHELL := /bin/bash

# Project configuration
PROJECT_NAME := insight
BACKEND_PORT := 8081
FRONTEND_PORT := 3000

# Docker Compose files
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.override.yml
COMPOSE_PROD_FILE := docker-compose.prod.yml

# Environment variables for local development
export REDIS_HOST := localhost
export POSTGRES_HOST := localhost
export POSTGRES_PORT := 5433
export ELASTICSEARCH_HOST := localhost
export SERVER_PORT := $(BACKEND_PORT)
export AWS_ENDPOINT_URL := http://localhost:4566
export AWS_REGION := us-east-1
export AWS_ACCESS_KEY_ID := test
export AWS_SECRET_ACCESS_KEY := test

# Colors for output (may not work on Windows cmd)
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(CYAN)Insight Development Commands$(NC)"
	@echo "============================"
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  make setup      - First-time setup (install deps, start everything)"
	@echo "  make start      - Start infra + backend + frontend (local dev)"
	@echo "  make stop       - Stop all running services"
	@echo ""
	@echo "$(GREEN)All Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# LOCAL DEVELOPMENT (Recommended for daily development)
# =============================================================================

.PHONY: setup
setup: ## First-time setup: copy .env, install deps, start services
	@echo "$(GREEN)Setting up Insight development environment...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@echo "$(CYAN)Installing dependencies...$(NC)"
	@if command -v ./gradlew > /dev/null 2>&1; then ./gradlew dependencies --quiet; else echo "Skipping Gradle (no gradlew)"; fi
	cd sam-dashboard && npm install
	@echo "$(GREEN)Starting infrastructure services...$(NC)"
	docker-compose up -d postgres redis elasticsearch localstack
	@echo "$(CYAN)Waiting for services to be healthy...$(NC)"
	@sleep 8
	@echo "$(CYAN)Initializing S3 buckets...$(NC)"
	@docker-compose exec -T localstack awslocal s3 mb s3://samgov-documents 2>/dev/null || true
	@docker-compose exec -T localstack awslocal s3 mb s3://samgov-attachments 2>/dev/null || true
	@docker-compose exec -T localstack awslocal s3 mb s3://samgov-exports 2>/dev/null || true
	@echo ""
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo ""
	@echo "$(CYAN)Services running:$(NC)"
	@echo "  PostgreSQL:    localhost:5433"
	@echo "  Redis:         localhost:6379"
	@echo "  Elasticsearch: localhost:9200"
	@echo "  LocalStack/S3: localhost:4566"
	@echo ""
	@echo "$(CYAN)Next steps:$(NC)"
	@echo "  make start      - Start backend + frontend"
	@echo ""

.PHONY: start
start: infra start-backend-bg start-frontend-bg ## Start everything (infra + backend + frontend)
	@echo ""
	@echo "$(GREEN)All services started!$(NC)"
	@echo ""
	@echo "$(CYAN)URLs:$(NC)"
	@echo "  Frontend:      http://localhost:$(FRONTEND_PORT)"
	@echo "  Backend API:   http://localhost:$(BACKEND_PORT)"
	@echo ""
	@echo "$(CYAN)Logs:$(NC)"
	@echo "  Backend:  Check terminal or run: make logs-backend-local"
	@echo "  Frontend: Check terminal or run: make logs-frontend-local"
	@echo ""

.PHONY: start-all
start-all: start ## Alias for 'start'

.PHONY: infra
infra: ## Start infrastructure only (Postgres, Redis, Elasticsearch, LocalStack/S3)
	@echo "$(GREEN)Starting infrastructure services...$(NC)"
	docker-compose up -d postgres redis elasticsearch localstack
	@echo "$(GREEN)Infrastructure running (including S3 via LocalStack).$(NC)"

.PHONY: start-backend
start-backend: ## Start backend (foreground, with logs)
	@echo "$(GREEN)Starting Spring Boot backend on port $(BACKEND_PORT)...$(NC)"
	REDIS_HOST=localhost SERVER_PORT=$(BACKEND_PORT) ./gradlew bootRun

.PHONY: start-backend-bg
start-backend-bg: ## Start backend (background)
	@echo "$(GREEN)Starting Spring Boot backend in background...$(NC)"
	@nohup bash -c 'REDIS_HOST=localhost SERVER_PORT=$(BACKEND_PORT) ./gradlew bootRun --no-daemon > logs/backend.log 2>&1' &
	@mkdir -p logs
	@echo "$(GREEN)Backend starting... logs at logs/backend.log$(NC)"

.PHONY: start-frontend
start-frontend: ## Start frontend (foreground, with logs)
	@echo "$(GREEN)Starting Vite frontend on port $(FRONTEND_PORT)...$(NC)"
	cd sam-dashboard && npm run dev

.PHONY: start-frontend-bg
start-frontend-bg: ## Start frontend (background)
	@echo "$(GREEN)Starting Vite frontend in background...$(NC)"
	@mkdir -p logs
	@nohup bash -c 'cd sam-dashboard && npm run dev > ../logs/frontend.log 2>&1' &
	@echo "$(GREEN)Frontend starting... logs at logs/frontend.log$(NC)"

.PHONY: stop
stop: ## Stop all services (local + Docker)
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@-pkill -f "gradlew bootRun" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-pkill -f "node.*sam-dashboard" 2>/dev/null || true
	docker-compose stop
	@echo "$(GREEN)All services stopped.$(NC)"

.PHONY: stop-local
stop-local: ## Stop only local services (backend + frontend)
	@echo "$(YELLOW)Stopping local services...$(NC)"
	@-pkill -f "gradlew bootRun" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-pkill -f "node.*sam-dashboard" 2>/dev/null || true
	@echo "$(GREEN)Local services stopped.$(NC)"

.PHONY: restart
restart: stop start ## Restart all services

.PHONY: restart-backend
restart-backend: ## Restart backend only
	@echo "$(YELLOW)Restarting backend...$(NC)"
	@-pkill -f "gradlew bootRun" 2>/dev/null || true
	@sleep 2
	$(MAKE) start-backend-bg

.PHONY: restart-frontend
restart-frontend: ## Restart frontend only
	@echo "$(YELLOW)Restarting frontend...$(NC)"
	@-pkill -f "vite" 2>/dev/null || true
	@-pkill -f "node.*sam-dashboard" 2>/dev/null || true
	@sleep 1
	$(MAKE) start-frontend-bg

.PHONY: logs-backend-local
logs-backend-local: ## Tail backend logs
	@tail -f logs/backend.log 2>/dev/null || echo "No backend log found. Is backend running?"

.PHONY: logs-frontend-local
logs-frontend-local: ## Tail frontend logs
	@tail -f logs/frontend.log 2>/dev/null || echo "No frontend log found. Is frontend running?"

# =============================================================================
# DOCKER DEVELOPMENT (Full containerized environment)
# =============================================================================

.PHONY: up
up: ## Start all services in Docker
	@echo "$(GREEN)Starting Insight services in Docker...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started. Run 'make logs' to view logs.$(NC)"

.PHONY: up-build
up-build: ## Start all services and rebuild images
	@echo "$(GREEN)Building and starting Insight services...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)Services started. Run 'make logs' to view logs.$(NC)"

.PHONY: down
down: ## Stop all Docker services
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Docker services stopped.$(NC)"

.PHONY: down-v
down-v: ## Stop Docker services and remove volumes
	@echo "$(RED)Stopping services and removing volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)Services stopped and volumes removed.$(NC)"

# =============================================================================
# LOGGING
# =============================================================================

.PHONY: logs
logs: ## View Docker logs (all services)
	docker-compose logs -f

.PHONY: logs-backend
logs-backend: ## View Docker backend logs
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend: ## View Docker frontend logs
	docker-compose logs -f frontend

.PHONY: logs-db
logs-db: ## View database service logs
	docker-compose logs -f postgres redis elasticsearch

# =============================================================================
# STATUS
# =============================================================================

.PHONY: ps
ps: ## Show Docker container status
	docker-compose ps

.PHONY: status
status: ## Show all service status
	@echo ""
	@echo "$(CYAN)Docker Services:$(NC)"
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || docker-compose ps
	@echo ""
	@echo "$(CYAN)Local Processes:$(NC)"
	@pgrep -f "gradlew bootRun" > /dev/null && echo "  Backend:  Running" || echo "  Backend:  Not running"
	@pgrep -f "vite" > /dev/null && echo "  Frontend: Running" || echo "  Frontend: Not running"
	@echo ""

.PHONY: health
health: status ## Alias for status

# =============================================================================
# TESTING
# =============================================================================

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo "$(CYAN)Running backend tests...$(NC)"
	./gradlew test

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "$(CYAN)Running frontend tests...$(NC)"
	cd sam-dashboard && npm test

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	@echo "$(CYAN)Running E2E tests...$(NC)"
	cd sam-dashboard && npm run test:e2e

.PHONY: lint
lint: ## Run linters
	@echo "$(CYAN)Running linters...$(NC)"
	cd sam-dashboard && npm run lint

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(CYAN)Running type check...$(NC)"
	cd sam-dashboard && npx tsc --noEmit

.PHONY: check
check: lint typecheck test ## Run all checks (lint, typecheck, tests)

# =============================================================================
# BUILD
# =============================================================================

.PHONY: build
build: build-backend build-frontend ## Build both backend and frontend

.PHONY: build-backend
build-backend: ## Build backend (JAR)
	@echo "$(GREEN)Building backend...$(NC)"
	./gradlew build -x test

.PHONY: build-frontend
build-frontend: ## Build frontend (production)
	@echo "$(GREEN)Building frontend...$(NC)"
	cd sam-dashboard && npm run build

# =============================================================================
# DATABASE
# =============================================================================

.PHONY: db-shell
db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U dev_user -d sam_opportunities

.PHONY: redis-shell
redis-shell: ## Open Redis CLI
	docker-compose exec redis redis-cli

# =============================================================================
# S3 / LOCALSTACK
# =============================================================================

.PHONY: s3-init
s3-init: ## Initialize S3 buckets in LocalStack
	@echo "$(GREEN)Initializing S3 buckets...$(NC)"
	docker-compose exec localstack sh -c '/etc/localstack/init/ready.d/init-s3.sh' || \
	docker-compose exec localstack awslocal s3 mb s3://samgov-documents && \
	docker-compose exec localstack awslocal s3 mb s3://samgov-attachments && \
	docker-compose exec localstack awslocal s3 mb s3://samgov-exports
	@echo "$(GREEN)S3 buckets initialized.$(NC)"

.PHONY: s3-list
s3-list: ## List S3 buckets
	docker-compose exec localstack awslocal s3 ls

.PHONY: s3-shell
s3-shell: ## Open shell in LocalStack container
	docker-compose exec localstack bash

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)WARNING: This will destroy all database data!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker-compose stop postgres
	docker-compose rm -f postgres
	docker volume rm samgov_pg-data 2>/dev/null || true
	docker-compose up -d postgres
	@echo "$(GREEN)Database reset complete.$(NC)"

# =============================================================================
# CLEANUP
# =============================================================================

.PHONY: clean
clean: stop ## Stop all services and clean up
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down --remove-orphans
	rm -rf logs/*.log
	@echo "$(GREEN)Cleanup complete.$(NC)"

.PHONY: clean-all
clean-all: ## Remove everything (containers, volumes, node_modules)
	@echo "$(RED)WARNING: This will remove all containers, volumes, and node_modules!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --remove-orphans
	rm -rf sam-dashboard/node_modules
	rm -rf logs
	./gradlew clean
	@echo "$(GREEN)Full cleanup complete.$(NC)"

.PHONY: prune
prune: ## Prune unused Docker resources
	@echo "$(YELLOW)Pruning Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Prune complete.$(NC)"

# =============================================================================
# INSTALL
# =============================================================================

.PHONY: install
install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	./gradlew dependencies --quiet || true
	cd sam-dashboard && npm install
	@echo "$(GREEN)Dependencies installed.$(NC)"

.PHONY: install-frontend
install-frontend: ## Install frontend dependencies only
	cd sam-dashboard && npm install

.PHONY: install-backend
install-backend: ## Download backend dependencies
	./gradlew dependencies

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: env
env: ## Show current environment configuration
	@echo ""
	@echo "$(CYAN)Environment Configuration:$(NC)"
	@echo "  BACKEND_PORT:       $(BACKEND_PORT)"
	@echo "  FRONTEND_PORT:      $(FRONTEND_PORT)"
	@echo "  REDIS_HOST:         $(REDIS_HOST)"
	@echo "  POSTGRES_HOST:      $(POSTGRES_HOST)"
	@echo "  POSTGRES_PORT:      $(POSTGRES_PORT)"
	@echo "  ELASTICSEARCH_HOST: $(ELASTICSEARCH_HOST)"
	@echo ""

.PHONY: urls
urls: ## Show service URLs
	@echo ""
	@echo "$(CYAN)Service URLs:$(NC)"
	@echo "  Frontend:      http://localhost:$(FRONTEND_PORT)"
	@echo "  Backend API:   http://localhost:$(BACKEND_PORT)"
	@echo "  PostgreSQL:    localhost:$(POSTGRES_PORT)"
	@echo "  Redis:         localhost:6379"
	@echo "  Elasticsearch: localhost:9200"
	@echo "  LocalStack/S3: http://localhost:4566"
	@echo ""

# Default target
.DEFAULT_GOAL := help

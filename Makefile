# =============================================================================
# SAMGov Project Makefile
# =============================================================================
# This Makefile provides convenient commands for managing the SAMGov
# development environment using Docker Compose.
#
# Usage: make <target>
# Run 'make help' to see available commands.
# =============================================================================

# Default shell
SHELL := /bin/bash

# Project name (used for container naming)
PROJECT_NAME := samgov

# Docker Compose files
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.override.yml
COMPOSE_PROD_FILE := docker-compose.prod.yml

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(CYAN)SAMGov Docker Management$(NC)"
	@echo "========================="
	@echo ""
	@echo "$(GREEN)Available Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Development Commands
# =============================================================================

.PHONY: up
up: ## Start all services in development mode
	@echo "$(GREEN)Starting SAMGov services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started. Run 'make logs' to view logs.$(NC)"

.PHONY: up-build
up-build: ## Start all services and rebuild images
	@echo "$(GREEN)Building and starting SAMGov services...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)Services started. Run 'make logs' to view logs.$(NC)"

.PHONY: down
down: ## Stop all services
	@echo "$(YELLOW)Stopping SAMGov services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Services stopped.$(NC)"

.PHONY: down-v
down-v: ## Stop all services and remove volumes
	@echo "$(RED)Stopping SAMGov services and removing volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)Services stopped and volumes removed.$(NC)"

.PHONY: restart
restart: down up ## Restart all services

.PHONY: rebuild
rebuild: down up-build ## Stop, rebuild, and restart all services

# =============================================================================
# Service-Specific Commands
# =============================================================================

.PHONY: up-db
up-db: ## Start only database services (postgres, redis, elasticsearch)
	@echo "$(GREEN)Starting database services...$(NC)"
	docker-compose up -d postgres redis elasticsearch

.PHONY: up-backend
up-backend: ## Start backend service only
	@echo "$(GREEN)Starting backend service...$(NC)"
	docker-compose up -d backend

.PHONY: up-frontend
up-frontend: ## Start frontend service only
	@echo "$(GREEN)Starting frontend service...$(NC)"
	docker-compose up -d frontend

.PHONY: restart-backend
restart-backend: ## Restart backend service
	@echo "$(YELLOW)Restarting backend service...$(NC)"
	docker-compose restart backend

.PHONY: restart-frontend
restart-frontend: ## Restart frontend service
	@echo "$(YELLOW)Restarting frontend service...$(NC)"
	docker-compose restart frontend

# =============================================================================
# Logging Commands
# =============================================================================

.PHONY: logs
logs: ## View logs from all services
	docker-compose logs -f

.PHONY: logs-backend
logs-backend: ## View logs from backend service
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend: ## View logs from frontend service
	docker-compose logs -f frontend

.PHONY: logs-db
logs-db: ## View logs from database services
	docker-compose logs -f postgres redis elasticsearch

# =============================================================================
# Status and Inspection Commands
# =============================================================================

.PHONY: ps
ps: ## Show status of all containers
	docker-compose ps

.PHONY: stats
stats: ## Show resource usage statistics
	docker stats --no-stream $$(docker-compose ps -q)

.PHONY: health
health: ## Check health status of all services
	@echo "$(CYAN)Health Status:$(NC)"
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# =============================================================================
# Shell Access Commands
# =============================================================================

.PHONY: shell-backend
shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

.PHONY: shell-frontend
shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

.PHONY: shell-db
shell-db: ## Open psql shell in postgres container
	docker-compose exec postgres psql -U $${POSTGRES_USER:-dev_user} -d $${POSTGRES_DB:-sam_opportunities}

.PHONY: shell-redis
shell-redis: ## Open redis-cli in redis container
	docker-compose exec redis redis-cli

# =============================================================================
# Build Commands
# =============================================================================

.PHONY: build
build: ## Build all Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

.PHONY: build-backend
build-backend: ## Build backend Docker image
	@echo "$(GREEN)Building backend image...$(NC)"
	docker-compose build backend

.PHONY: build-frontend
build-frontend: ## Build frontend Docker image
	@echo "$(GREEN)Building frontend image...$(NC)"
	docker-compose build frontend

.PHONY: build-nocache
build-nocache: ## Build all images without cache
	@echo "$(GREEN)Building Docker images (no cache)...$(NC)"
	docker-compose build --no-cache

# =============================================================================
# Database Commands
# =============================================================================

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)WARNING: This will destroy all database data!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker volume rm samgov_pg_data 2>/dev/null || true
	docker-compose up -d postgres
	@echo "$(GREEN)Database reset complete.$(NC)"

.PHONY: db-backup
db-backup: ## Create database backup
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U $${POSTGRES_USER:-dev_user} $${POSTGRES_DB:-sam_opportunities} > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup created in backups/ directory.$(NC)"

.PHONY: db-restore
db-restore: ## Restore database from latest backup
	@echo "$(GREEN)Restoring database from latest backup...$(NC)"
	@LATEST=$$(ls -t backups/*.sql 2>/dev/null | head -1) && \
	if [ -n "$$LATEST" ]; then \
		cat "$$LATEST" | docker-compose exec -T postgres psql -U $${POSTGRES_USER:-dev_user} $${POSTGRES_DB:-sam_opportunities}; \
		echo "$(GREEN)Restored from $$LATEST$(NC)"; \
	else \
		echo "$(RED)No backup files found in backups/ directory$(NC)"; \
	fi

# =============================================================================
# Production Commands
# =============================================================================

.PHONY: prod-up
prod-up: ## Start services in production mode
	@echo "$(GREEN)Starting SAMGov in production mode...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) up -d
	@echo "$(GREEN)Production services started.$(NC)"

.PHONY: prod-down
prod-down: ## Stop production services
	@echo "$(YELLOW)Stopping production services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) down

.PHONY: prod-logs
prod-logs: ## View production logs
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) logs -f

.PHONY: prod-build
prod-build: ## Build production images
	@echo "$(GREEN)Building production images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) build

# =============================================================================
# Cleanup Commands
# =============================================================================

.PHONY: clean
clean: ## Stop services and remove containers
	@echo "$(YELLOW)Cleaning up containers...$(NC)"
	docker-compose down --remove-orphans
	@echo "$(GREEN)Cleanup complete.$(NC)"

.PHONY: clean-all
clean-all: ## Remove all containers, volumes, and images
	@echo "$(RED)WARNING: This will remove all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --rmi all --remove-orphans
	@echo "$(GREEN)Full cleanup complete.$(NC)"

.PHONY: clean-volumes
clean-volumes: ## Remove all named volumes
	@echo "$(RED)Removing all project volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)Volumes removed.$(NC)"

.PHONY: clean-images
clean-images: ## Remove all project images
	@echo "$(YELLOW)Removing project images...$(NC)"
	docker-compose down --rmi local
	@echo "$(GREEN)Images removed.$(NC)"

.PHONY: prune
prune: ## Prune unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Prune complete.$(NC)"

# =============================================================================
# Testing Commands
# =============================================================================

.PHONY: test
test: ## Run all tests (backend + frontend)
	@echo "$(CYAN)Running all tests...$(NC)"
	$(MAKE) test-backend
	$(MAKE) test-frontend

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

# =============================================================================
# Development Helpers
# =============================================================================

.PHONY: install
install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	./gradlew dependencies
	cd sam-dashboard && npm install
	@echo "$(GREEN)Dependencies installed.$(NC)"

.PHONY: dev
dev: up-db ## Start development environment (DB + local apps)
	@echo "$(GREEN)Database services started. Run backend and frontend locally.$(NC)"
	@echo "$(CYAN)Backend: ./gradlew bootRun$(NC)"
	@echo "$(CYAN)Frontend: cd sam-dashboard && npm run dev$(NC)"

.PHONY: init
init: ## Initialize development environment
	@echo "$(GREEN)Initializing SAMGov development environment...$(NC)"
	@cp -n .env.example .env 2>/dev/null || true
	$(MAKE) install
	$(MAKE) up-build
	@echo "$(GREEN)Development environment ready!$(NC)"
	@echo ""
	@echo "$(CYAN)Services:$(NC)"
	@echo "  Frontend:      http://localhost:3000"
	@echo "  Backend API:   http://localhost:8080"
	@echo "  PostgreSQL:    localhost:5433"
	@echo "  Redis:         localhost:6379"
	@echo "  Elasticsearch: localhost:9200"
	@echo "  LocalStack:    localhost:4566"
	@echo ""

# =============================================================================
# Documentation
# =============================================================================

.PHONY: docs
docs: ## Show documentation links
	@echo ""
	@echo "$(CYAN)SAMGov Documentation$(NC)"
	@echo "===================="
	@echo ""
	@echo "  Docker Compose:  https://docs.docker.com/compose/"
	@echo "  Spring Boot:     https://spring.io/projects/spring-boot"
	@echo "  React + Vite:    https://vitejs.dev/guide/"
	@echo "  PostgreSQL:      https://www.postgresql.org/docs/"
	@echo "  Redis:           https://redis.io/documentation"
	@echo "  Elasticsearch:   https://www.elastic.co/guide/"
	@echo "  LocalStack:      https://docs.localstack.cloud/"
	@echo ""

# Default target
.DEFAULT_GOAL := help

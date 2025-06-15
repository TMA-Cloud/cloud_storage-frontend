# ===============================
# Makefile for TMA Cloud Frontend
# ===============================

# Configurable Variables
IMAGE       := tma-cloud-frontend
ENV_FILE    ?= .env

# Dynamic Variables
VERSION     := $(shell grep -oE "appVersion *= *['\"]([^'\"]+)['\"]" vite.config.ts | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")
COMMIT      := $(shell git rev-parse --short HEAD)
TAG         := $(VERSION)
FULL_IMAGE  := $(IMAGE):$(TAG)

# Phony Targets
.PHONY: all docker-build docker-run clean version

# Default target
all: docker-build

# Print current version and commit (useful for debugging)
version:
	@echo "Version: $(VERSION)"
	@echo "Commit:  $(COMMIT)"
	@echo "Image:   $(FULL_IMAGE)"

# Build Docker image
docker-build:
	@echo "Building Docker image $(FULL_IMAGE)..."
	@docker build \
		--build-arg APP_VERSION=$(VERSION) \
		--build-arg COMMIT=$(COMMIT) \
		-t $(FULL_IMAGE) .

# Run Docker container locally
docker-run:
	@echo "Running Docker container..."
	@docker run --rm \
		-p 3000:3000 \
		--env-file $(ENV_FILE) \
		$(FULL_IMAGE)

# Clean dangling images
clean:
	@echo "Cleaning dangling Docker images..."
	@docker image prune -f

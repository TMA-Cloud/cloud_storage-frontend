# ---- Build stage ----
FROM node:24-alpine AS build
WORKDIR /app

# Build arguments for injecting version info
ARG APP_VERSION
ARG COMMIT

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the SvelteKit app
RUN npm run build

# ---- Production stage ----
FROM node:24-alpine AS production
WORKDIR /app

# Build arguments for injecting version info
ARG APP_VERSION
ARG COMMIT

# Node env variable
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app and static assets from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/static ./static

# Create non-root user & group (good practice: explicit UID/GID)
RUN addgroup -S appgroup -g 1001 && adduser -S appuser -u 1001 -G appgroup

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Copy entrypoint script and fix permissions
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown appuser:appgroup /usr/local/bin/docker-entrypoint.sh

# Provide basic metadata for container registries
LABEL org.opencontainers.image.title="TMA Cloud Frontend" \
    org.opencontainers.image.description="TMA Cloud Storage" \
    org.opencontainers.image.source="https://github.com/TMA-Cloud/cloud_storage-frontend" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version=$APP_VERSION \
    org.opencontainers.image.revision=$COMMIT

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "build"]

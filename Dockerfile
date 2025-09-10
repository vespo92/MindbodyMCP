# Build stage - Use Bun runtime for maximum performance
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

# Install dumb-init for signal handling and curl for healthchecks
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --chown=nodejs:nodejs .env.example .env.example
COPY --chown=nodejs:nodejs CLAUDE.md CLAUDE.md

# Switch to non-root user
USER nodejs

# Expose SSE server port
EXPOSE 3000

# Health check for SSE server
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server - defaults to STDIO, but can be overridden
# For SSE: docker run -e MCP_TRANSPORT=sse image
# Or override: docker run image bun run dist/index.js --transport sse
CMD ["bun", "run", "dist/index.js"]
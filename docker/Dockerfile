FROM node:20-alpine AS builder

WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -f package.json package-lock.json node_modules/.package-lock.json

FROM node:20-alpine

RUN addgroup -S meditrack && adduser -S meditrack -G meditrack

WORKDIR /app

# Only copy production node_modules (no dev dependencies, no lock files)
COPY --from=builder /app/node_modules ./node_modules

# Copy only application source files
COPY app/server.js app/logger.js ./
COPY app/routes/ ./routes/
COPY app/monitoring/ ./monitoring/
COPY app/public/ ./public/
COPY app/vulnerabilities/ ./vulnerabilities/

RUN chown -R meditrack:meditrack /app
USER meditrack

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

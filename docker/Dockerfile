FROM node:18-alpine AS builder

WORKDIR /app
COPY app/package*.json ./
RUN npm ci --only=production

FROM node:18-alpine

RUN addgroup -S meditrack && adduser -S meditrack -G meditrack

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY app/ ./

RUN chown -R meditrack:meditrack /app
USER meditrack

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

# 1) Builder: install deps & compile TS
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2) Runtime with poppler & tesseract
FROM node:20-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils tesseract-ocr tesseract-ocr-eng \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY config.json ./config.json
# cache directory for @xenova/transformers models
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
RUN mkdir -p $TRANSFORMERS_CACHE

# default command shows help
CMD ["node", "dist/cli/index.js", "reorder", "--help"]

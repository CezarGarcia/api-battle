FROM oven/bun:1.4.4-slim

WORKDIR /app
COPY package.json ./
COPY src ./src
COPY docs ./docs
COPY scripts ./scripts
COPY dataset ./dataset

CMD ["bun", "src/server.js"]

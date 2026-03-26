# CivicSense Frontend - Production Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm install -g @react-router/serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["react-router-serve", "./build/server/index.js"]

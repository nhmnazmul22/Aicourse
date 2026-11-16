# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package.json ./
RUN npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Stage 2: run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]

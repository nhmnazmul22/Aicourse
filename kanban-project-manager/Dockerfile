# Stage 1: build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# Stage 3: run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/out ./dist/frontend/out
COPY backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]

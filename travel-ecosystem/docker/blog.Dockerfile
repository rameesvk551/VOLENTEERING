# Blog Micro-frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/blog/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/blog/ ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

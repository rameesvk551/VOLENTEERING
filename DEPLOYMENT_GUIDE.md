# 🚀 Deployment Guide

## Overview
This guide will help you deploy the following services:
- **Shell** (Micro-frontend Host Container)
- **Blog** (Micro-frontend)
- **Admin Dashboard** (Standalone React App)
- **Backend Services** (API Gateway, Auth, Blog, Admin)

## ✅ Pre-Deployment Checklist

### 1. Ensure Clean Git State
Before deployment, make sure all changes are committed:
```bash
git status
```

If you have uncommitted changes, commit them:
```bash
git add .
git commit -m "Your commit message"
```

### 2. Run Health Check
The pre-deployment script will check for uncommitted changes and other issues:
```bash
chmod +x pre-deployment-check.sh
./pre-deployment-check.sh
```

If you need to deploy despite uncommitted changes (not recommended):
```bash
./pre-deployment-check.sh --force
```

### 3. Environment Variables

#### Shell (.env)
```bash
cd travel-ecosystem/shell
cat > .env << EOF
VITE_API_URL=https://your-api-gateway.com
EOF
```

#### Blog (.env)
```bash
cd travel-ecosystem/apps/blog
cat > .env << EOF
VITE_API_BASE_URL=https://your-api-gateway.com/api
VITE_SEO_BASE_URL=https://your-blog-domain.com
EOF
```

#### Admin Dashboard (.env)
```bash
cd travel-ecosystem/apps/admin-dashboard
cat > .env << EOF
VITE_API_BASE_URL=https://your-api-gateway.com/api
VITE_APP_NAME=Travel Admin Dashboard
EOF
```

#### API Gateway (.env)
```bash
cd travel-ecosystem-backend/api-gateway
cat > .env << EOF
PORT=4000
NODE_ENV=production

# CORS - Add your frontend domains
CORS_ORIGIN=https://your-shell-domain.com,https://your-admin-domain.com,https://your-blog-domain.com

# JWT Secret - Use a strong random string
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# Service URLs
AUTH_SERVICE_URL=http://auth-service:4001
BLOG_SERVICE_URL=http://blog-service:4003
ADMIN_SERVICE_URL=http://admin-service:4002

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

#### Auth Service (.env)
```bash
cd travel-ecosystem-backend/micro-services/auth
cat > .env << EOF
PORT=4001
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb://mongo:27017/travel-auth

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRE=7d

# Email (configure with your email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGIN=https://your-shell-domain.com,https://your-admin-domain.com
EOF
```

#### Blog Service (.env)
```bash
cd travel-ecosystem-backend/micro-services/blog
cat > .env << EOF
PORT=4003
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb://mongo:27017/travel-blog

# CORS
CORS_ORIGIN=https://your-shell-domain.com,https://your-blog-domain.com
EOF
```

#### Admin Service (.env)
```bash
cd travel-ecosystem-backend/micro-services/admin
cat > .env << EOF
PORT=4002
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb://mongo:27017/travel-admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# CORS
CORS_ORIGIN=https://your-admin-domain.com
EOF
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

Create a `docker-compose.prod.yml` file:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongo:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: change-this-password
    volumes:
      - mongo-data:/data/db
    networks:
      - travel-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - travel-network

  # API Gateway
  api-gateway:
    build:
      context: ./travel-ecosystem-backend/api-gateway
      dockerfile: Dockerfile
    restart: always
    ports:
      - "4000:4000"
    env_file:
      - ./travel-ecosystem-backend/api-gateway/.env
    depends_on:
      - redis
      - auth-service
      - blog-service
      - admin-service
    networks:
      - travel-network

  # Auth Microservice
  auth-service:
    build:
      context: ./travel-ecosystem-backend/micro-services/auth
      dockerfile: Dockerfile
    restart: always
    env_file:
      - ./travel-ecosystem-backend/micro-services/auth/.env
    depends_on:
      - mongo
    networks:
      - travel-network

  # Blog Microservice
  blog-service:
    build:
      context: ./travel-ecosystem-backend/micro-services/blog
      dockerfile: Dockerfile
    restart: always
    env_file:
      - ./travel-ecosystem-backend/micro-services/blog/.env
    depends_on:
      - mongo
    networks:
      - travel-network

  # Admin Microservice
  admin-service:
    build:
      context: ./travel-ecosystem-backend/micro-services/admin
      dockerfile: Dockerfile
    restart: always
    env_file:
      - ./travel-ecosystem-backend/micro-services/admin/.env
    depends_on:
      - mongo
    networks:
      - travel-network

  # Shell Frontend (Host Container)
  shell:
    build:
      context: ./travel-ecosystem/shell
      dockerfile: ../docker/shell.Dockerfile
    restart: always
    ports:
      - "5000:80"
    networks:
      - travel-network

  # Blog Frontend
  blog:
    build:
      context: ./travel-ecosystem/apps/blog
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5001:80"
    networks:
      - travel-network

  # Admin Dashboard Frontend
  admin-dashboard:
    build:
      context: ./travel-ecosystem/apps/admin-dashboard
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3002:80"
    networks:
      - travel-network

volumes:
  mongo-data:

networks:
  travel-network:
    driver: bridge
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Individual Docker Builds

#### Build and Run Shell
```bash
cd travel-ecosystem/shell
docker build -t travel-shell:latest -f ../docker/shell.Dockerfile .
docker run -d -p 5000:80 --name travel-shell travel-shell:latest
```

#### Build and Run Blog
```bash
cd travel-ecosystem/apps/blog
docker build -t travel-blog:latest .
docker run -d -p 5001:80 --name travel-blog travel-blog:latest
```

#### Build and Run Admin Dashboard
```bash
cd travel-ecosystem/apps/admin-dashboard
docker build -t travel-admin:latest .
docker run -d -p 3002:80 --name travel-admin travel-admin:latest
```

#### Build and Run API Gateway
```bash
cd travel-ecosystem-backend/api-gateway
docker build -t travel-api-gateway:latest .
docker run -d -p 4000:4000 --env-file .env --name api-gateway travel-api-gateway:latest
```

#### Build and Run Microservices
```bash
# Auth Service
cd travel-ecosystem-backend/micro-services/auth
docker build -t travel-auth:latest .
docker run -d -p 4001:4001 --env-file .env --name auth-service travel-auth:latest

# Blog Service
cd travel-ecosystem-backend/micro-services/blog
docker build -t travel-blog-service:latest .
docker run -d -p 4003:4003 --env-file .env --name blog-service travel-blog-service:latest

# Admin Service
cd travel-ecosystem-backend/micro-services/admin
docker build -t travel-admin-service:latest .
docker run -d -p 4002:4002 --env-file .env --name admin-service travel-admin-service:latest
```

## 🌐 Nginx Reverse Proxy (Optional but Recommended)

Create `/etc/nginx/sites-available/travel-ecosystem`:

```nginx
# API Gateway
upstream api_gateway {
    server localhost:4000;
}

# Shell Frontend
upstream shell {
    server localhost:5000;
}

# Blog Frontend
upstream blog {
    server localhost:5001;
}

# Admin Dashboard
upstream admin {
    server localhost:3002;
}

# API Gateway
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Shell
server {
    listen 80;
    server_name shell.yourdomain.com;

    location / {
        proxy_pass http://shell;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Blog
server {
    listen 80;
    server_name blog.yourdomain.com;

    location / {
        proxy_pass http://blog;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Dashboard
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/travel-ecosystem /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/TLS Certificates (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d shell.yourdomain.com -d blog.yourdomain.com -d admin.yourdomain.com
```

## 📊 Monitoring & Logs

### View Docker Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f api-gateway
docker logs -f auth-service
docker logs -f blog-service
docker logs -f admin-service
```

### Health Checks
```bash
# API Gateway
curl http://localhost:4000/health

# Auth Service
curl http://localhost:4001/health

# Blog Service
curl http://localhost:4003/health

# Admin Service
curl http://localhost:4002/health
```

## 🔄 Updates & Rollbacks

### Update Services
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback
```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🆘 Troubleshooting

### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart a Service
```bash
docker-compose -f docker-compose.prod.yml restart <service-name>
```

### Database Issues
```bash
# Access MongoDB shell
docker exec -it <mongo-container-id> mongosh -u admin -p <password>

# Show databases
show dbs

# Use a database
use travel-auth

# Show collections
show collections
```

## 📈 Performance Optimization

1. **Enable Gzip in Nginx**
2. **Set up CDN for static assets**
3. **Enable Redis caching in API Gateway**
4. **Set up MongoDB indexes**
5. **Enable HTTP/2 in Nginx**

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Use environment-specific JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable CORS with specific origins
- [ ] Set up backup strategy for MongoDB
- [ ] Enable monitoring and alerts

## 🎉 Your Deployment is Complete!

Visit your applications:
- Shell: http://shell.yourdomain.com
- Blog: http://blog.yourdomain.com
- Admin: http://admin.yourdomain.com
- API: http://api.yourdomain.com

Happy deploying! 🚀

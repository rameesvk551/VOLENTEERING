# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ System Requirements

- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] At least 4GB RAM available
- [ ] 20GB disk space available
- [ ] OpenAI API key ready
- [ ] Domain/server configured (if deploying remotely)

### ✅ Security

- [ ] `.env` file properly configured (not in git)
- [ ] API keys secured
- [ ] Rate limiting configured
- [ ] CORS settings reviewed
- [ ] MongoDB authentication enabled (production)
- [ ] Redis password set (production)
- [ ] Firewall rules configured

### ✅ Testing

- [ ] All unit tests passing: `npm test`
- [ ] Type checking clean: `npm run type-check`
- [ ] Linter passing: `npm run lint`
- [ ] Health check working: `npm run health`
- [ ] Test crawl successful: `make test-crawl`

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
node --version
docker --version
docker-compose --version
```

### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd travel-ecosystem/services/discovery-engine

# Install dependencies
npm install
npx playwright install chromium

# Configure environment
cp .env.example .env
nano .env  # Edit with production values
```

### 3. Environment Configuration

Production `.env`:

```env
# Environment
NODE_ENV=production
PORT=3000

# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-your-production-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Database URLs
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
WEAVIATE_URL=http://localhost:8080

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Performance
CRAWLER_RATE_LIMIT=10
CRAWLER_CONCURRENT_REQUESTS=5
CRAWLER_WORKER_CONCURRENCY=2
ETL_WORKER_CONCURRENCY=3

# Cache
CACHE_TTL_QUERY_RESULT=3600
CACHE_TTL_ENTITY_DETAIL=86400

# Features
ENABLE_STREAMING=true
ENABLE_GRAPH_RECOMMENDATIONS=true
ENABLE_CACHING=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 4. Start Services

```bash
# Start Docker services
docker-compose up -d

# Wait for services to be ready
sleep 10

# Verify services
npm run health
```

### 5. Build and Start Application

```bash
# Build TypeScript
npm run build

# Start API server (using PM2 recommended)
npm install -g pm2
pm2 start npm --name "discovery-api" -- start

# Start workers
pm2 start npm --name "crawler-worker" -- run worker:crawler
pm2 start npm --name "etl-worker" -- run worker:etl

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Verify Deployment

```bash
# Check health
npm run health

# Test API
curl http://localhost:3000/api/v1/health

# View PM2 status
pm2 status

# View logs
pm2 logs
```

## PM2 Configuration (Recommended)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'discovery-api',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G'
    },
    {
      name: 'crawler-worker',
      script: 'dist/workers/crawler.worker.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/crawler-error.log',
      out_file: './logs/crawler-out.log',
      max_memory_restart: '1G'
    },
    {
      name: 'etl-worker',
      script: 'dist/workers/etl.worker.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/etl-error.log',
      out_file: './logs/etl-out.log',
      max_memory_restart: '1G'
    }
  ]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/discovery-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo systemctl status certbot.timer
```

## Monitoring

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor resources
htop

# Monitor disk I/O
iotop

# Monitor network
nethogs
```

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs

# Health check
npm run health:verbose

# Docker stats
docker stats
```

### Log Rotation

Create `/etc/logrotate.d/discovery-engine`:

```
/path/to/discovery-engine/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/discovery-engine"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# MongoDB backup
docker exec discovery-mongodb mongodump --db=travel_discovery --out=/tmp/backup
docker cp discovery-mongodb:/tmp/backup "$BACKUP_DIR/mongodb-$DATE"

# Redis backup
docker exec discovery-redis redis-cli BGSAVE
docker cp discovery-redis:/data/dump.rdb "$BACKUP_DIR/redis-$DATE.rdb"

# Compress
tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" "$BACKUP_DIR/mongodb-$DATE" "$BACKUP_DIR/redis-$DATE.rdb"
rm -rf "$BACKUP_DIR/mongodb-$DATE" "$BACKUP_DIR/redis-$DATE.rdb"

# Keep only last 7 days
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup-$DATE.tar.gz"
EOF

chmod +x backup.sh
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/discovery-engine/backup.sh >> /var/log/discovery-backup.log 2>&1
```

## Maintenance

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart with PM2
pm2 restart all
```

### Database Maintenance

```bash
# MongoDB
docker exec discovery-mongodb mongosh travel_discovery --eval "db.runCommand({compact: 'places'})"

# Redis
docker exec discovery-redis redis-cli BGREWRITEAOF
```

### Clean Old Data

```bash
# Remove old crawl cache (older than 7 days)
npm run cli -- clear-cache --all

# Clean logs
find logs/ -name "*.log" -mtime +30 -delete
```

## Troubleshooting

### High Memory Usage

```bash
# Check memory
free -h

# Restart services
pm2 restart all
docker-compose restart
```

### Slow Performance

```bash
# Check Redis cache hit rate
docker exec discovery-redis redis-cli INFO stats | grep hit_rate

# MongoDB indexes
docker exec discovery-mongodb mongosh travel_discovery --eval "db.places.getIndexes()"

# Clear cache
npm run cli -- clear-cache --all
```

### Service Down

```bash
# Check logs
pm2 logs --err
docker-compose logs

# Restart
pm2 restart all
docker-compose restart

# Full restart
pm2 kill
docker-compose down
docker-compose up -d
npm run build
pm2 start ecosystem.config.js
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple API Instances**: PM2 cluster mode
3. **Shared Redis**: Single Redis instance
4. **MongoDB Replica Set**: For high availability

### Vertical Scaling

1. **Increase worker concurrency**
2. **More PM2 instances**
3. **Larger Docker resource limits**
4. **Better server hardware**

## Security Hardening

```bash
# Firewall (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# MongoDB authentication
docker-compose down
# Edit docker-compose.yml to add MONGO_INITDB_ROOT_USERNAME and PASSWORD
docker-compose up -d
```

## Performance Tuning

### Node.js

```bash
# Increase max old space size
export NODE_OPTIONS="--max-old-space-size=4096"
```

### MongoDB

```javascript
// Create indexes
db.places.createIndex({ city: 1, type: 1 });
db.places.createIndex({ "location.coordinates": "2dsphere" });
db.places.createIndex({ createdAt: -1 });
```

### Redis

```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## Monitoring Dashboard

Consider setting up:
- **Grafana + Prometheus**: System metrics
- **PM2 Plus**: Application monitoring
- **Uptime Robot**: External monitoring
- **Sentry**: Error tracking

## Support & Maintenance

- Regular updates: Weekly
- Security patches: Immediately
- Backup verification: Monthly
- Performance review: Monthly
- Log analysis: Weekly

---

**Deployment checklist completed! Your Discovery Engine is production-ready! 🚀**

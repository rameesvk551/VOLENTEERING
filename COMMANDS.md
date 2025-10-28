# Quick Command Reference

## 🚀 Start/Stop Commands

```bash
# Start everything
./start-blog-system.sh

# Stop everything
./stop-blog-system.sh

# Test integration
./test-blog-system.sh

# Start with Docker Compose
docker-compose -f docker-compose.blog-system.yml up -d

# Stop Docker Compose
docker-compose -f docker-compose.blog-system.yml down
```

## 🔍 Check Services

```bash
# Check all services are running
curl http://localhost:4001/health  # Auth
curl http://localhost:4000/health  # Admin
curl http://localhost:4003/health  # Blog

# Check MongoDB
docker ps | grep mongodb

# View logs
tail -f /tmp/auth-service.log
tail -f /tmp/blog-service.log
tail -f /tmp/admin-service.log
```

## 🧪 Quick API Tests

```bash
# Signup
curl -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get blogs
curl http://localhost:4003/api/blog

# Get featured blogs
curl http://localhost:4003/api/blog/featured
```

## 🗄️ MongoDB Commands

```bash
# Connect to MongoDB
docker exec -it travel-mongodb mongosh -u admin -p password123

# List databases
show dbs

# Use auth database
use travel-auth

# List users
db.users.find().pretty()

# Make user admin
db.users.updateOne(
  {email: "your-email@example.com"},
  {$set: {role: "admin"}}
)
```

## 📍 URLs

- Shell: http://localhost:5173
- Blog: http://localhost:5001
- Admin: http://localhost:5002
- Auth API: http://localhost:4001/api/auth
- Blog API: http://localhost:4003/api/blog
- Admin API: http://localhost:4000/api/admin

## 🐛 Troubleshooting

```bash
# Kill process on port
lsof -i :4001
kill -9 <PID>

# Restart MongoDB
docker restart travel-mongodb

# View all Docker logs
docker-compose -f docker-compose.blog-system.yml logs -f

# Check environment variables
cat travel-ecosystem/shell/.env
cat travel-ecosystem/apps/blog/.env
cat travel-ecosystem/apps/admin-dashboard/.env
```

# 🐳 Docker Deployment Guide

This guide explains how to deploy the Farmer Help platform using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Quick Start

### Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/phuhao00/farmer_help.git
   cd farmer_help
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - MongoDB: localhost:27017

### Production Environment

1. **Set up production environment**
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

3. **Access through Nginx**
   - Application: http://localhost (port 80)
   - HTTPS: https://localhost (port 443, requires SSL setup)

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
ALLOWED_ORIGINS=http://localhost:3000

# Production specific (for docker-compose.prod.yml)
NODE_ENV=production
```

### SSL Configuration (Production)

For HTTPS support, place your SSL certificates in the `ssl/` directory:

```bash
mkdir ssl
# Copy your certificates
cp your-cert.crt ssl/
cp your-private-key.key ssl/
```

Update `nginx.conf` to include SSL configuration.

## 📦 Services Overview

### MongoDB (Database)
- **Image**: mongo:6.0
- **Port**: 27017 (development only)
- **Data**: Persisted in `mongodb_data` volume
- **Initialization**: Runs `mongo-init.js` on first start

### Backend (Go API)
- **Build**: Custom Dockerfile in `server-go/`
- **Port**: 8080
- **Dependencies**: MongoDB
- **Health Check**: Waits for MongoDB before starting

### Frontend (React)
- **Build**: Custom Dockerfile in `client/`
- **Port**: 3000 (development), 80 (production via Nginx)
- **Dependencies**: Backend API
- **Hot Reload**: Enabled in development mode

### Nginx (Reverse Proxy - Production)
- **Image**: nginx:alpine
- **Ports**: 80, 443
- **Features**: Load balancing, SSL termination, rate limiting
- **Logs**: Stored in `logs/nginx/`

## 🛠 Docker Commands

### Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access service shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mongodb mongosh
```

### Production Commands

```bash
# Deploy production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Backup database
docker-compose exec mongodb mongodump --out /data/backup
```

### Maintenance Commands

```bash
# Clean up unused images
docker image prune -a

# Clean up volumes (⚠️ This will delete data)
docker volume prune

# View resource usage
docker stats

# Check service health
docker-compose ps
```

## 📊 Monitoring

### Health Checks

Check service status:
```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Performance Monitoring

```bash
# Resource usage
docker stats

# Container inspection
docker inspect farmer_help_backend
```

## 🔒 Security Considerations

### Production Security

1. **Environment Variables**
   - Use strong passwords for MongoDB
   - Generate secure JWT secrets
   - Use production Stripe keys

2. **Network Security**
   - MongoDB not exposed to host in production
   - Rate limiting configured in Nginx
   - Security headers enabled

3. **SSL/TLS**
   - Configure SSL certificates for HTTPS
   - Redirect HTTP to HTTPS
   - Use strong cipher suites

### Database Security

```bash
# Create database backup
docker-compose exec mongodb mongodump --db farm_to_table --out /data/backup

# Restore from backup
docker-compose exec mongodb mongorestore /data/backup
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :27017
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test connection
   docker-compose exec backend ping mongodb
   ```

3. **Build Failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -a
   docker-compose up -d --build
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   chmod +x server-go/wait-for-it.sh
   ```

### Debug Mode

Enable debug logging:
```bash
# Set debug environment
export COMPOSE_LOG_LEVEL=DEBUG
docker-compose up
```

## 📈 Scaling

### Horizontal Scaling

Scale backend services:
```bash
docker-compose up -d --scale backend=3
```

### Load Balancing

Nginx automatically load balances between backend instances.

## 🔄 Updates and Maintenance

### Rolling Updates

```bash
# Pull latest images
docker-compose pull

# Restart with zero downtime
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend
```

### Database Migrations

```bash
# Run database migrations
docker-compose exec backend go run migrations/migrate.go
```

## 📝 Logs

### Log Locations

- **Application Logs**: `docker-compose logs [service]`
- **Nginx Logs**: `logs/nginx/` (production)
- **MongoDB Logs**: Container logs

### Log Rotation

Configure log rotation in production:
```bash
# Add to crontab
0 0 * * * docker-compose exec nginx nginx -s reopen
```

## 🆘 Support

For deployment issues:
1. Check service logs: `docker-compose logs [service]`
2. Verify environment variables
3. Check port availability
4. Review Docker and Docker Compose versions
5. Consult the main README.md for application-specific issues

---

**Happy Deploying! 🚀**
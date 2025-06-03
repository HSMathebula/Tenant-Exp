# Deployment Guide

## Prerequisites

1. **Required Accounts**
   - AWS Account (or your preferred cloud provider)
   - GitHub Account
   - Docker Hub Account (optional)

2. **Required Tools**
   - Node.js 20.x
   - Docker
   - AWS CLI (or your cloud provider's CLI)
   - Git

## Environment Setup

1. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_USERNAME=your-db-username
   DB_PASSWORD=your-db-password
   DB_NAME=tenant_experience

   # JWT
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRATION=15m
   REFRESH_TOKEN_EXPIRATION=7d

   # Server
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Database Setup**
   ```bash
   # Connect to your PostgreSQL instance
   psql -h your-db-host -U your-db-username -d tenant_experience

   # Run migrations
   npm run migrate
   ```

## Deployment Steps

### 1. Backend Deployment

#### Using Docker (Recommended)

1. **Build the Docker image**
   ```bash
   docker build -t tenant-experience-backend:latest .
   ```

2. **Push to Docker Hub (optional)**
   ```bash
   docker tag tenant-experience-backend:latest yourusername/tenant-experience-backend:latest
   docker push yourusername/tenant-experience-backend:latest
   ```

3. **Deploy to AWS ECS**
   ```bash
   # Create ECS cluster
   aws ecs create-cluster --cluster-name tenant-experience

   # Create task definition
   aws ecs register-task-definition --cli-input-json file://task-definition.json

   # Create service
   aws ecs create-service --cli-input-json file://service-definition.json
   ```

#### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### 2. Frontend Deployment

1. **Build the React Native app**
   ```bash
   # For Android
   npm run build:android

   # For iOS
   npm run build:ios
   ```

2. **Deploy to App Stores**
   - Follow the respective guidelines for [Google Play Store](https://developer.android.com/distribute) and [Apple App Store](https://developer.apple.com/app-store/)

### 3. Database Deployment

1. **Set up PostgreSQL**
   ```bash
   # Using AWS RDS
   aws rds create-db-instance \
     --db-instance-identifier tenant-experience-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password your-password \
     --allocated-storage 20
   ```

2. **Configure security groups**
   - Allow inbound traffic on port 5432 from your application servers
   - Enable SSL/TLS for database connections

## Monitoring Setup

1. **Set up AWS CloudWatch**
   ```bash
   # Create log group
   aws logs create-log-group --log-group-name /tenant-experience/app

   # Create metric filter
   aws logs put-metric-filter \
     --log-group-name /tenant-experience/app \
     --filter-name ErrorCount \
     --filter-pattern "ERROR" \
     --metric-transformations \
       metricName=ErrorCount,metricNamespace=TenantExperience,metricValue=1
   ```

2. **Set up alerts**
   ```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name HighErrorRate \
     --alarm-description "Alarm when error rate exceeds threshold" \
     --metric-name ErrorCount \
     --namespace TenantExperience \
     --statistic Sum \
     --period 300 \
     --threshold 10 \
     --comparison-operator GreaterThanThreshold \
     --evaluation-periods 2 \
     --alarm-actions arn:aws:sns:region:account-id:your-topic
   ```

## Post-Deployment Checklist

1. **Verify Deployment**
   - Check application logs
   - Monitor error rates
   - Test all critical features
   - Verify database connections

2. **Security Checks**
   - SSL/TLS configuration
   - Firewall rules
   - Access control
   - API endpoints security

3. **Performance Monitoring**
   - Response times
   - Resource utilization
   - Database performance
   - API latency

## Rollback Procedure

1. **Database Rollback**
   ```bash
   npm run migrate:rollback
   ```

2. **Application Rollback**
   ```bash
   # Using Docker
   docker pull yourusername/tenant-experience-backend:previous-version
   docker-compose down
   docker-compose up -d

   # Manual deployment
   git checkout previous-version
   npm install
   npm run build
   npm start
   ```

## Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update

   # Security patches
   npm audit fix
   ```

2. **Backup Strategy**
   ```bash
   # Database backup
   pg_dump -h your-db-host -U your-db-username tenant_experience > backup.sql

   # Application backup
   tar -czf app-backup.tar.gz /path/to/app
   ```

## Troubleshooting

1. **Common Issues**
   - Database connection issues
   - Memory leaks
   - Performance degradation
   - SSL/TLS errors

2. **Debugging Tools**
   - AWS CloudWatch Logs
   - PostgreSQL logs
   - Application logs
   - Network monitoring

## Support

For deployment support, contact:
- Technical Support: support@yourdomain.com
- Emergency Contact: emergency@yourdomain.com

## Updates

This deployment guide will be updated as the application evolves. Last updated: [Current Date] 
#!/bin/bash

# EC2 Deployment Script for Content Manager
# This script sets up the application on an EC2 instance

set -e  # Exit on any error

echo "🚀 Starting EC2 deployment for Content Manager..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📚 Installing Git..."
sudo yum install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/content-manager
sudo chown ec2-user:ec2-user /opt/content-manager
cd /opt/content-manager

# Clone repository (replace with your actual repository URL)
echo "📥 Cloning repository..."
# git clone https://github.com/your-username/content-manager.git .
# OR copy files manually if not using git

# Create environment file
echo "🔧 Creating environment file..."
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/content_manager"

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

echo "⚠️  Please update the .env file with your actual configuration values!"

# Set proper permissions
echo "🔐 Setting file permissions..."
chmod 600 .env

# Create SSL directory for Nginx (if using HTTPS)
echo "🔒 Creating SSL directory..."
mkdir -p ssl

# Build and start the application
echo "🏗️  Building and starting the application..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 30

# Check application health
echo "🏥 Checking application health..."
if curl -f http://localhost/health; then
    echo "✅ Application is healthy!"
else
    echo "❌ Application health check failed!"
    echo "📋 Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Setup firewall (if using ufw)
echo "🔥 Setting up firewall..."
sudo yum install -y ufw
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

# Setup automatic updates
echo "🔄 Setting up automatic updates..."
sudo yum install -y yum-cron
sudo systemctl enable yum-cron
sudo systemctl start yum-cron

# Create systemd service for auto-restart
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/content-manager.service > /dev/null << EOF
[Unit]
Description=Content Manager Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/content-manager
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable content-manager.service

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/content-manager > /dev/null << EOF
/opt/content-manager/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for Content Manager

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup environment file
cp .env $BACKUP_DIR/env_backup_$DATE

# Backup database (if you have direct access)
# pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Setup cron job for backups
echo "⏰ Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/content-manager/backup.sh") | crontab -

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your actual configuration"
echo "2. Restart the application: docker-compose -f docker-compose.prod.yml restart"
echo "3. Access your application at: http://your-ec2-public-ip"
echo "4. Set up a domain name and SSL certificate if needed"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "- Restart app: docker-compose -f docker-compose.prod.yml restart"
echo "- Stop app: docker-compose -f docker-compose.prod.yml down"
echo "- Update app: git pull && docker-compose -f docker-compose.prod.yml up -d --build" 
# Content Manager - Syllabus Management System

A comprehensive syllabus management system for schools built with Next.js, Prisma, PostgreSQL, and AWS S3.

## 🚀 Features

- **School Registration & Management**: Complete school onboarding and management system
- **Teacher Management**: Teacher registration, profile management, and assignment
- **Syllabus Upload & Management**: PDF syllabus upload and organization by classes
- **Class Management**: Dynamic class creation and management
- **File Storage**: AWS S3 integration for secure file storage
- **Responsive Design**: Modern, mobile-friendly UI
- **Security**: Password hashing, rate limiting, and security headers

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Styling**: CSS Modules
- **Deployment**: Docker, Nginx, AWS EC2

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database
- AWS account with S3 bucket
- Docker and Docker Compose (for production)

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd content-manneger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/content_manager"
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-s3-bucket-name
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

#### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   # Development
   npm run docker:compose
   
   # Production with Nginx
   npm run docker:compose:prod
   ```

2. **Access the application**
   - Development: http://localhost:3000
   - Production: http://your-server-ip

#### Option 2: AWS EC2 Deployment

1. **Launch an EC2 instance**
   - Use Amazon Linux 2 or Ubuntu
   - Configure security groups for ports 22, 80, 443

2. **Run the deployment script**
   ```bash
   chmod +x ec2-deploy.sh
   ./ec2-deploy.sh
   ```

3. **Update environment variables**
   Edit `/opt/content-manager/.env` with your actual values

4. **Restart the application**
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

## 📁 Project Structure

```
content-manneger/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── add-teacher/    # Teacher registration
│   │   ├── manage-classes/ # Class management
│   │   ├── school-registration/ # School registration
│   │   ├── upload-syllabus/ # Syllabus upload
│   │   └── view-*/         # View pages
│   ├── components/         # Reusable components
│   └── lib/               # Utilities (Prisma, S3)
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── nginx.conf             # Nginx configuration
└── ec2-deploy.sh          # EC2 deployment script
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run docker:build` - Build Docker image
- `npm run docker:compose` - Start with Docker Compose
- `npm run docker:compose:prod` - Start production with Nginx

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `S3_BUCKET_NAME` | S3 bucket name | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🔒 Security Features

- Password hashing with bcrypt
- Rate limiting on API endpoints
- Security headers (XSS protection, CSRF, etc.)
- Input validation and sanitization
- Secure file upload handling

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- **Schools**: School information and credentials
- **Teachers**: Teacher profiles and assignments
- **Classes**: Class definitions
- **LessonPdf**: Syllabus files and metadata
- **ClassResponse**: Class completion tracking
- **EventApplication**: Event management
- **LeaveApplication**: Leave request management

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Set up PostgreSQL database (RDS recommended)
- [ ] Create S3 bucket and configure permissions
- [ ] Set up AWS IAM user with S3 access
- [ ] Configure environment variables
- [ ] Test application locally

### Production Setup
- [ ] Use production Docker configuration
- [ ] Set up Nginx reverse proxy
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline (optional)

### Security
- [ ] Use strong database passwords
- [ ] Restrict AWS IAM permissions
- [ ] Configure firewall rules
- [ ] Enable HTTPS
- [ ] Regular security updates

## 🔍 Monitoring & Maintenance

### Health Checks
- Application health: `GET /api/health`
- Database connectivity check
- S3 connectivity verification

### Logs
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# View Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

### Backups
- Database backups (configure with your database provider)
- Environment file backups
- Application code backups (Git)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the deployment logs

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

---

**Note**: This is a production-ready application with comprehensive deployment configurations for AWS EC2. Make sure to review and customize the configuration according to your specific requirements. 
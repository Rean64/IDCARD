# MINDEF ID-CARD Backend API

Node.js/Express backend for the MINDEF ID Card Management System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

## 📊 Database Management

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/mindef_idcard_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"
```

## 📡 API Documentation

The API runs on `http://localhost:3001` and provides:

- **Authentication**: Admin login and user management  
- **Applications**: ID card application management
- **Payments**: Payment processing and verification
- **Appointments**: Biometric appointment booking
- **Locations**: Service location management
- **File Upload**: Document upload and management
- **Admin**: Dashboard statistics and bulk operations

Visit `http://localhost:3001/api` for full API documentation.

## 🎯 Sample Data

The seed script creates:
- 1 Admin user (admin@mindef.gov.cm / mindef2024)
- 4 Service locations across Cameroon
- 3 Sample applications with different statuses
- Sample appointments and payments

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Request rate limiting
- Input validation
- CORS protection
- Security headers with Helmet

## 📋 Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
# MINDEF ID-CARD Management System

A comprehensive full-stack web application for managing national ID card applications in Cameroon's Ministry of Defense (MINDEF).

## 🚀 Features

### 🎯 For Citizens
- **No Registration Required** - Apply directly without creating accounts
- **Multi-Service Support** - First ID Card, Renewal, Lost/Stolen, Damaged Card
- **Online Payment** - Credit/Debit Cards, Mobile Money, Bank Transfer
- **Appointment Booking** - Schedule biometric data collection
- **Real-time Tracking** - Track application status
- **Document Upload** - Secure document submission

### 🛠️ For Administrators
- **Admin Dashboard** - Comprehensive application management
- **Review & Approval** - Document review and application processing
- **Payment Management** - Track payments and revenue
- **Appointment Management** - Manage biometric appointments
- **Analytics & Reports** - Generate detailed reports
- **Bulk Operations** - Bulk approve applications

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Vite** for development and building
- **Motion** for animations

### Backend
- **Node.js** with Express
- **Prisma ORM** with MongoDB
- **JWT Authentication**
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Express Rate Limiting**

### Database
- **MongoDB** for data storage
- **Prisma** for type-safe database access

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd mindef-idcard-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URL and other configurations

# Generate Prisma client and setup database
npm run db:generate
npm run db:push

# Seed the database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# From root directory
npm install

# Start development server
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Applications (Public)
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application details

### Applications (Admin)
- `GET /api/applications` - Get all applications
- `PATCH /api/applications/:id/status` - Update status
- `GET /api/applications/stats/overview` - Get statistics

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/verify/:txnId` - Verify payment
- `GET /api/payments/methods/available` - Get payment methods

### Appointments
- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/availability` - Check availability
- `GET /api/appointments/confirmation/:number` - Get appointment

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location details

### File Upload
- `POST /api/upload/:appId/:docType` - Upload document
- `GET /api/upload/application/:appId` - Get documents

## 💳 Payment Integration

The system supports multiple payment methods:

1. **Credit/Debit Cards** - Instant processing
2. **Mobile Money** - MTN, Orange, Express Union
3. **Bank Transfer** - Direct bank transfers

### Application Fees
- **First ID Card**: 10,000 FCFA
- **Renewal**: 5,000 FCFA
- **Lost/Stolen**: 10,000 FCFA
- **Damaged**: 7,500 FCFA

## 📱 Application Process

### For Citizens
1. **Select Service Type** - Choose ID card service
2. **Fill Application Form** - Multi-step form with validation
3. **Upload Documents** - Secure document upload
4. **Make Payment** - Choose preferred payment method
5. **Book Appointment** - Schedule biometric collection
6. **Complete Process** - Receive confirmation and tracking

### For Administrators
1. **Login** - Use admin credentials (admin@mindef.gov.cm / mindef2024)
2. **Review Applications** - Review submitted applications
3. **Verify Documents** - Check uploaded documents
4. **Approve/Reject** - Process applications with reasons
5. **Manage Appointments** - View and manage appointments
6. **Generate Reports** - Export data and analytics

## 🔐 Security Features

- **JWT Authentication** for secure admin access
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **File Upload Security** with type and size restrictions
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers

## 📊 Database Schema

### Key Models
- **User** - Admin users
- **Application** - ID card applications
- **Payment** - Payment records
- **Appointment** - Biometric appointments
- **Location** - Service locations
- **Document** - Uploaded documents

## 🚀 Deployment

### Backend Deployment
```bash
# Build and start production server
npm run start

# Or with PM2
pm2 start src/index.js --name mindef-backend
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files (use nginx, apache, or CDN)
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mongodb://localhost:27017/mindef_idcard_db"
JWT_SECRET="your-jwt-secret"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
```

### Frontend
Set `VITE_API_BASE_URL` for production API endpoint.

## 📝 Default Credentials

**Admin Access:**
- Email: `admin@mindef.gov.cm`
- Password: `mindef2024`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api`

## 🎯 Development Status

- ✅ Frontend UI/UX Complete
- ✅ Backend API Complete  
- ✅ Database Schema Complete
- ✅ Authentication System
- ✅ Payment Integration (Mock)
- ✅ File Upload System
- ✅ Admin Dashboard
- ✅ Application Management
- ✅ Appointment System

## 🔄 Roadmap

- [ ] Email Notifications
- [ ] SMS Integration
- [ ] Real Payment Gateway Integration
- [ ] ID Card Generation
- [ ] Advanced Analytics
- [ ] Mobile App
- [ ] Multi-language Support
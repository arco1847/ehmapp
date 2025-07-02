# Healthcare Prescription Management Backend

A comprehensive Node.js backend for healthcare prescription management with MySQL database.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Prescription Management**: CRUD operations for prescriptions
- **Appointment Booking**: Complete appointment management system
- **Doctor Directory**: Doctor profiles and availability management
- **Health Analytics**: Comprehensive health statistics
- **Notifications**: Medication and appointment reminders
- **Security**: Rate limiting, CORS, helmet security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Database Structure

### Tables Overview

1. **users** (9 columns) - User profiles and authentication
2. **prescriptions** (13 columns) - Prescription records
3. **doctors** (14 columns) - Doctor profiles and information
4. **appointments** (14 columns) - Appointment bookings
5. **doctor_availability** (7 columns) - Doctor schedule management
6. **notifications** (9 columns) - User notifications
7. **medical_history** (7 columns) - User medical history
8. **allergies** (6 columns) - User allergies
9. **medication_reminders** (8 columns) - Medication reminder settings

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE EMP;
```

2. Import the schema:
```bash
mysql -u root -p EMP < database/schema.sql
```

### 3. Environment Configuration

1. Copy environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=EMP
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
FRONTEND_URL=http://localhost:8081
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Prescriptions
- `GET /api/prescriptions` - Get user prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get specific prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment

### Doctors
- `GET /api/doctors` - Get doctors list
- `GET /api/doctors/:id` - Get doctor details

### Health Stats
- `GET /api/health/stats` - Get user health statistics

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- SQL injection prevention with parameterized queries
- Input validation and sanitization

## Testing

Run tests:
```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up SSL/TLS certificates
4. Configure reverse proxy (nginx)
5. Set up database backups
6. Monitor logs and performance

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
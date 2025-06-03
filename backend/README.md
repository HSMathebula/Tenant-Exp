# Tenant Experience Backend

This is the backend service for the Tenant Experience application, built with Node.js, Express, and TypeORM.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Server configuration
   NODE_ENV=development
   PORT=3000
   API_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3001

   # Database configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=tenant_experience
   DB_SSL=false

   # JWT configuration
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h

   # Email configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password
   SMTP_FROM=noreply@tenantexperience.com

   # File upload configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=uploads

   # Logging configuration
   LOG_LEVEL=info
   LOG_FILE=app.log

   # Rate limiting
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX=100
   ```

4. Create the database:
   ```bash
   createdb tenant_experience
   ```

5. Run migrations:
   ```bash
   npm run typeorm migration:run
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

### Main Endpoints

- `/api/users` - User management
- `/api/properties` - Property management
- `/api/units` - Unit management
- `/api/maintenance` - Maintenance request management
- `/api/payments` - Payment management
- `/api/events` - Event management
- `/api/documents` - Document management

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm start` - Start the production server
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run typeorm` - Run TypeORM CLI commands

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── index.ts        # Application entry point
```

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License.

## API Endpoints

### Health Check
- GET `/api/health` - Check if the server is running

## Database Schema

### User
- id: UUID (Primary Key)
- firstName: string
- lastName: string
- email: string (unique)
- password: string
- phoneNumber: string (optional)
- avatar: string (optional)
- role: 'tenant' | 'admin' | 'maintenance'
- createdAt: Date
- updatedAt: Date

### MaintenanceRequest
- id: UUID (Primary Key)
- title: string
- description: text
- status: 'pending' | 'in-progress' | 'completed'
- assignedTo: string (optional)
- completionNotes: string (optional)
- user: User (Foreign Key)
- createdAt: Date
- updatedAt: Date

### Notification
- id: UUID (Primary Key)
- title: string
- message: text
- read: boolean
- type: 'maintenance' | 'payment' | 'announcement' | 'general'
- user: User (Foreign Key)
- createdAt: Date 
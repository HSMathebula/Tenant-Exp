# Tenant Experience Backend

A Node.js/Express backend service for the Tenant Experience platform.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- TypeORM
- PostgreSQL
- Socket.IO
- JWT Authentication
- AWS S3
- Nodemailer

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── templates/      # Email templates
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── tests/              # Test files
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## API Documentation

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "tenant"
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Users

#### GET /api/users
Get all users (admin only).

#### GET /api/users/:id
Get user by ID.

#### PUT /api/users/:id
Update user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Properties

#### GET /api/properties
Get all properties.

#### POST /api/properties
Create new property (admin only).

**Request Body:**
```json
{
  "name": "Sunset Apartments",
  "address": "123 Main St",
  "units": 50,
  "amenities": ["pool", "gym"]
}
```

### Maintenance

#### GET /api/maintenance
Get maintenance requests.

#### POST /api/maintenance
Create maintenance request.

**Request Body:**
```json
{
  "title": "Leaking Faucet",
  "description": "Kitchen sink is leaking",
  "priority": "medium",
  "propertyId": "123"
}
```

### Payments

#### GET /api/payments
Get payment history.

#### POST /api/payments
Create payment.

**Request Body:**
```json
{
  "amount": 1500.00,
  "propertyId": "123",
  "paymentMethod": "credit_card"
}
```

### Documents

#### GET /api/documents
Get user documents.

#### POST /api/documents
Upload document.

**Request Body:**
```multipart/form-data
file: <file>
type: "lease"
```

### Events

#### GET /api/events
Get community events.

#### POST /api/events
Create event (admin only).

**Request Body:**
```json
{
  "title": "Community BBQ",
  "description": "Annual summer BBQ",
  "date": "2024-07-15",
  "location": "Community Pool"
}
```

### Chat

#### GET /api/chat/conversations
Get user conversations.

#### POST /api/chat/messages
Send message.

**Request Body:**
```json
{
  "conversationId": "123",
  "content": "Hello!",
  "type": "text"
}
```

## WebSocket Events

### Chat Events

- `message`: New message received
- `typing`: User is typing
- `read`: Message read status
- `online`: User online status

### Notification Events

- `notification`: New notification
- `maintenance_update`: Maintenance request update
- `payment_confirmation`: Payment confirmation
- `document_upload`: Document upload notification

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Authentication
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRATION=24h

# Database Configuration
DB_USERNAME=tenant_app_user
DB_PASSWORD=your_secure_db_password_here
DB_NAME=tenant_experience_db
DB_HOST=db
DB_PORT=5432

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com
```

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required variables

3. Run database migrations:
```bash
npm run typeorm migration:run
```

4. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Run linter
- `npm run typeorm`: Run TypeORM CLI

## Testing

Run tests with:
```bash
npm test
```

Run specific test file:
```bash
npm test -- src/tests/auth.test.ts
```

## Error Handling

The API uses a standardized error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

Common error codes:
- `AUTH_ERROR`: Authentication related errors
- `VALIDATION_ERROR`: Request validation errors
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Permission denied
- `INTERNAL_ERROR`: Server internal errors

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## Logging

The application uses Winston for logging with the following levels:
- error: 0
- warn: 1
- info: 2
- http: 3
- debug: 4

Logs are stored in `logs/` directory.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

This project is licensed under the MIT License. 
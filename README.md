# Trading App Backend

A TypeScript Node.js backend for a trading application built with Express.js.

## Features

- 🔐 **Authentication**: JWT-based authentication with registration and login
- 📊 **Trading**: Mock trading endpoints for orders, positions, and trades
- 👤 **User Management**: User profiles and account summaries
- 🛡️ **Security**: Helmet, CORS, rate limiting, and input validation
- 📝 **Logging**: Request logging with Morgan
- ⚡ **TypeScript**: Full TypeScript support with strict typing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_key_here
CORS_ORIGIN=http://localhost:8081
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run build:watch` - Build in watch mode
- `npm run clean` - Clean build directory
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Trading

- `GET /api/trading/trades` - Get user's trades
- `GET /api/trading/positions` - Get user's positions
- `POST /api/trading/order` - Place a new order
- `GET /api/trading/market-data/:symbol` - Get market data for a symbol

### User

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/account-summary` - Get account summary

### Health Check

- `GET /health` - Health check endpoint

## Project Structure

```
src/
├── middleware/          # Express middleware
│   ├── auth.ts         # Authentication middleware
│   ├── errorHandler.ts # Error handling middleware
│   └── notFound.ts     # 404 handler
├── routes/             # API routes
│   ├── auth.ts         # Authentication routes
│   ├── trading.ts      # Trading routes
│   └── user.ts         # User routes
├── types/              # TypeScript type definitions
│   └── index.ts
└── index.ts            # Main application file
```

## Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protects against brute force attacks
- **Input Validation**: Express-validator for request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:8081 |

## Mock Data

This backend currently uses in-memory mock data for demonstration purposes. In a production environment, you would replace this with a proper database like PostgreSQL, MongoDB, or MySQL.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC# chartsnap-backend

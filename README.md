# Savings Goal Management API

A Node.js API for managing savings goals and tracking progress, built with Express, TypeScript, and MongoDB.

## Features

- 🔐 User Authentication & Authorization
- 💰 Savings Goals Management
- 📝 Comprehensive API Documentation
- 🚀 Event-Driven Architecture

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Zod Validation
- Winston Logger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://localhost:27017/pursepal
APP_NAME=pursepal
ACCESS_TOKEN_EXPIRE=3600
ACCESS_TOKEN_SECRET=your_secret_key
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/logout` - Logout user

### User Management

- `GET /api/user/me` - Get current user
- `GET /api/user` - Get all users (Admin only)

### Saving Goals

- `POST /api/saving-goal` - Create saving goal
- `GET /api/saving-goal` - Get all saving goals
- `GET /api/saving-goal/:id` - Get specific saving goal
- `PUT /api/saving-goal/:id` - Update saving goal
- `DELETE /api/saving-goal/:id` - Delete saving goal

### Savings

- `POST /api/saving` - Create saving entry
- `GET /api/saving` - Get all savings
- `GET /api/saving/:id` - Get specific saving
- `PUT /api/saving/:id` - Update saving
- `DELETE /api/saving/:id` - Delete saving

## Project Structure

```
src/
├── app/
│   ├── middlewares/
│   ├── modules/
│   │   ├── saving-goals/
│   │   ├── savings/
│   │   ├── user/
│   │   └── utility/
│   └── router.ts
├── config/
├── shared/
│   ├── helpers/
│   └── utils/
├── types/
└── server.ts
```

## Features in Detail

### User Management

- Secure user registration and authentication
- Role-based access control (Admin/User)
- JWT-based session management
- Password encryption using bcrypt

### Saving Goals

- Create and manage saving goals
- Track progress towards goals
- Different types of savings (emergency, retirement, education, etc.)
- Goal status tracking (active, completed, cancelled)

### Savings Tracking

- Record individual savings transactions
- Real-time goal progress updates
- Event-driven architecture for savings updates
- Comprehensive transaction history

## Error Handling

The API implements a robust error handling system with:

- Custom error classes
- Standardized error responses
- Validation error handling
- HTTP status code mapping

## Security Features

- JWT Authentication
- Password Hashing
- Rate Limiting
- CORS Protection
- Helmet Security Headers
- Input Validation
- Role-Based Access Control

## Development

```bash
# Run in development mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run tests
npm test
```

## Todo:

- [ ] Integrate Paystack payment gateway for seamless savings deposits and withdrawals
- [ ] Implement recurring savings feature with customizable frequency (daily, weekly, monthly)
- [ ] Add savings analytics dashboard with visual progress tracking and insights

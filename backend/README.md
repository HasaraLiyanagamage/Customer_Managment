# Customer Management System - Backend

This is the backend service for the Customer Management System, built with Node.js, Express, and MySQL using Sequelize ORM.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Password hashing with bcrypt

- **Customer Management**
  - CRUD operations for customers
  - File uploads for customer documents
  - Search and filtering capabilities

- **User Management**
  - User registration and profile management
  - Role-based permissions
  - Password reset functionality

- **Security**
  - Rate limiting
  - Data sanitization
  - XSS protection
  - CORS enabled
  - Helmet for secure HTTP headers

- **API Documentation**
  - RESTful API design
  - Error handling
  - Request validation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/customer-management-system.git
   cd customer-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other settings.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. The API will be available at `http://localhost:5000/api/v1`

## Database Setup

1. Create a new MySQL database:
   ```sql
   CREATE DATABASE customer_management_dev;
   ```

2. Run migrations:
   ```bash
   npm run migrate
   # or
   yarn migrate
   ```

3. (Optional) Seed the database with test data:
   ```bash
   npm run seed
   # or
   yarn seed
   ```

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

### Authentication

- **Register User**
  ```
  POST /api/v1/auth/register
  ```

- **Login**
  ```
  POST /api/v1/auth/login
  ```

- **Get Current User**
  ```
  GET /api/v1/auth/me
  ```

### Customers

- **Get All Customers**
  ```
  GET /api/v1/customers
  ```

- **Get Single Customer**
  ```
  GET /api/v1/customers/:id
  ```

- **Create Customer**
  ```
  POST /api/v1/customers
  ```

- **Update Customer**
  ```
  PUT /api/v1/customers/:id
  ```

- **Delete Customer**
  ```
  DELETE /api/v1/customers/:id
  ```

## Environment Variables

See `.env.example` for all available environment variables.

## Testing

Run tests using:
```bash
npm test
# or
yarn test
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update database and other production settings in `.env`
3. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
4. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please email support@yourdomain.com or open an issue in the repository.

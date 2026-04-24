# SmartTutorET Backend

This is the backend service for the SmartTutorET platform, built with Node.js, Express, and MongoDB.

## Project Structure

- `controllers/`: Handles incoming requests and business logic.
- `models/`: Mongoose schemas and data models.
- `routes/`: Defines API endpoints and maps them to controllers.
- `middleware/`: Custom Express middleware (e.g., authentication).
- `lib/`: Shared utilities, database connection, and socket configuration.
- `server.js`: Entry point of the application.

## Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with the following variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (default: 5001)
4. Start the development server:
   ```bash
   npm run dev
   ```

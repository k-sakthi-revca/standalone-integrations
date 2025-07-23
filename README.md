# Standalone Integrations

A web application for testing API integrations with a React frontend and Node.js backend.

## Project Structure

- `/integrations-fe` - React frontend application
- `/server` - Node.js backend server
  - `/server/routes` - API route handlers

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   USE_MOCK_DATA=false
   SECURITYSCORECARD_API_KEY=your_api_key_here
   ```
   
   Note: Replace `your_api_key_here` with your actual SecurityScorecard API key to fetch real data. If you don't have an API key, you can set `USE_MOCK_DATA=true` to use mock data instead.

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd integrations-fe
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the React app:
   ```
   npm run build
   ```

## Running the Application

### Important Note About API Communication

The frontend application is configured to communicate directly with the backend server at `http://localhost:5000`. This is necessary because the proxy configuration in package.json may not always work correctly in development mode. If you encounter any issues with API requests, ensure that:

1. The backend server is running on port 5000
2. CORS is properly configured on the backend (already done in the provided code)
3. The frontend is making requests to the correct URL (http://localhost:5000/api/...)

### Option 1: Development Mode (Recommended for Development)

1. Start the backend server:
   ```
   cd server
   npm install
   npm run dev
   ```

2. In a separate terminal, start the React development server:
   ```
   cd integrations-fe
   npm install
   npm start
   ```

3. Access the application:
   - Backend API: http://localhost:5000
   - React frontend: http://localhost:3000

### Option 2: Production Mode

1. Build the React app:
   ```
   cd integrations-fe
   npm install
   npm run build
   ```

2. Start the backend server:
   ```
   cd server
   npm install
   npm run dev
   ```

3. Access the application at http://localhost:5000

## Available API Integrations

- **SecurityScorecard** - Access SecurityScorecard API endpoints
  - Get Portfolios
  - Get Portfolio Companies

## Adding New Integrations

To add a new integration:

1. Create a new route file in `/server/routes`
2. Add the route to the server.js file
3. Add the integration configuration to the ApiTester component in the React app

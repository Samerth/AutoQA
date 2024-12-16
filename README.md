# Test Recorder POC

A web-based test recorder that captures user interactions and generates automated tests.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AutoQA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

4. Create a `.env` file in the root directory:
   ```plaintext
   NODE_ENV=development
   PORT=3000
   ```

## Running the Application

The application consists of two parts: a backend server and a frontend development server.
 In a new terminal, start  development server:
   ```bash
   npm run dev
   ```
   This will start the backend server at http://localhost:3000

   This will also start the frontend at http://localhost:3001

## Project Structure

```
/
├── src/
│   ├── auth/           # Authentication related code
│   ├── frontend/       # React frontend components
│   ├── interaction/    # Browser interaction tracking
│   ├── scenario/       # Test scenario management
│   ├── server/         # Express server implementation
│   └── storage/        # File-based storage system
├── index.html          # Frontend entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration for frontend
├── tsconfig.node.json  # TypeScript configuration for Vite
└── tsconfig.server.json # TypeScript configuration for backend
```

## Development

- Frontend code is in `src/frontend/`
- Backend code is in `src/server/`
- API endpoints are defined in `src/server/server.ts`
- Test scenarios are stored in the `scenarios/` directory

## Building for Production

To build the application for production:
```bash
npm run build
```
This will create a `dist` directory with the compiled code.

## Testing

Run the test suite:
```bash
npm test
```

## License

ISC

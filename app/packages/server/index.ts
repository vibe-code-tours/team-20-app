import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import router from './routes';

// ESM __dirname compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file and store them in process.env
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use the defined routes
app.use(router);

// Only listen when running directly (local dev)
// When imported by Netlify Function, skip listen
const isLambda = !!process.env.NETLIFY;
if (!isLambda) {
   const port = process.env.PORT || 3000;
   app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
   });
}

export default app;

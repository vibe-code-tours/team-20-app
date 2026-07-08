import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import router from './routes';

// Load environment variables from .env file and store them in process.env
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the defined routes
app.use(router);

// Start the server on the specified port, defaulting to 3000 if not set in environment variables
const port = process.env.PORT || 3000;

// Start the server and log a message to the console
app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});

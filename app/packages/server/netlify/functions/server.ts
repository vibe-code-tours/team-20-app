import express from 'express';
import serverless from 'serverless-http';
import app from '../../index';

// Ensure body parsing works in Netlify Functions (esbuild CJS bundle)
app.use(express.json());

export const handler = serverless(app);

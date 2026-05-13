/**
 * Serverless Handler for AWS Lambda, Vercel, or other serverless platforms
 * This file is used when deploying to serverless environments
 */

const serverless = require('serverless-http');
const app = require('./server');

// Wrap Express app for serverless environment
module.exports.handler = serverless(app);

// Alternative export for Vercel
module.exports = app;

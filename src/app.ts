//app.ts
//Builds the express instance(no server runs here)
//install middlewares
//morgan - removed due to error('dev') log requests
//xss-clean - sanitize / removed because clashing with express
//cors() - allow frontend to call the API
//express.json ({limit:1mb}) parses JSON bodies
//mounts all headers under /api/v1
//Has simple /health endpoint
//Register final error handler to format unexpected errors as JSON
//Cors config add.

import express from "express";
import cors from "cors";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import xss from "xss-clean";
// import morgan from "morgan";
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import userRoutes from './routes/users.routes';
import { errorHandler } from './middleware/error';

const app = express();

// Define CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(helmet());
// app.use(xss());
// app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Apply JSON parser only to routes that need it
app.use('/api/v1/auth', express.json({ limit: "1mb" }), authRoutes);

// This route handles multipart/form-data, so it does NOT get the JSON parser
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/users', express.json({ limit: "1mb" }), userRoutes); // This will handle /me

app.get("/health", (_req, res) => res.json({ ok: true }));

// The error handler must be registered after all routes and other middleware.
app.use(errorHandler);

export default app;

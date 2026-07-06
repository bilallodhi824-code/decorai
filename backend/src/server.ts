import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import * as dotenv from 'dotenv';
import apiRouter from './routes/api.routes';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for dev/testing ease
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Parse JSON request body
app.use(express.json());

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'DecorAI Enterprise REST API',
    status: 'operational',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', apiRouter);

// Catch-all 404 Route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  DecorAI Backend API Server is running`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});

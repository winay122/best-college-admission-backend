import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// Application Imports
import { swaggerDocs } from './config/swagger.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import mainRouter from './routes/index.js';

// 1. Initialize environment variables
dotenv.config();

// 2. Bootstrap Express App
const app = express();

// 3. Global Identity & Security Middlewares (Must be at top for static routes)
app.use(cors()); // Cross-Origin Resource Sharing
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows images to be loaded by different origins (User Portal)
  }),
);
app.use(express.json()); // Parse JSON payloads
app.use(morgan("dev")); // Log incoming HTTP requests

// 4. Static Media Distribution
app.use("/uploads", express.static("public/uploads"));

// 5. Rate Limiter (Apply strictly to API scopes)
app.use("/api/", apiLimiter);

// 5. API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 6. Register Application Routes
app.use('/api', mainRouter);

// 7. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running flawlessly on port ${PORT}`);
  console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

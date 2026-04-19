import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { initSocket } from './services/socket.service.js';

// Application Imports
import { swaggerDocs } from './config/swagger.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import mainRouter from './routes/index.js';

// 1. Initialize environment variables
dotenv.config();

// 2. Bootstrap Express App
const app = express();
const httpServer = createServer(app);

// 3. Initialize Real-Time Engine (Socket.io)
initSocket(httpServer);

// 4. Global Identity & Security Middlewares
app.use(cors()); 
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// 5. Static Media Distribution
app.use("/uploads", express.static("public/uploads"));

// 6. Rate Limiter
app.use("/api/", apiLimiter);

// 7. API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 8. Register Application Routes
app.use('/api', mainRouter);

// 9. Start the Server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server with Real-Time Chat is running on port ${PORT}`);
  console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

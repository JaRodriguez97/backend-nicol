import express from "express";
import "dotenv/config";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Rutas
import citaRoutes from "./routes/citaRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

// Middlewares de seguridad
import { helmetConfig, corsOptions, securityHeaders } from "./middlewares/securityMiddleware.js";
import { apiLimiter, loginLimiter, citaLimiter } from "./middlewares/rateLimitMiddleware.js";
import cors from "cors";

const app = express();
connectDB();

// Configuración personalizada de CORS que sobre-escribe la importada
const customCorsOptions = {
  origin: ["https://nicolrnails.netlify.app", "http://localhost:4200"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares básicos
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: false })); // Parser de URL-encoded

// Middlewares de seguridad
app.use(cors(customCorsOptions)); // CORS
app.use(helmetConfig); // Protección de cabeceras HTTP
app.use(securityHeaders); // Cabeceras de seguridad adicionales
app.use(apiLimiter); // Rate limiting general

// Rutas de la API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/servicios", servicioRoutes);

// Importar middlewares de manejo de errores
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware.js";

// Middleware para rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware para manejo de errores
app.use(errorHandler);

export default app;

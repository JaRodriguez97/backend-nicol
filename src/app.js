import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import connectDB from "./config/db.js";
import citaRoutes from "./routes/citaRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import { env } from "process";

const app = express();
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde.",
});
const corsOptions = {
  origin: [env.frontend], // tu dominio de frontend en producción
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // si usas cookies o tokens en headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);
app.use(helmet());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/servicios", servicioRoutes);

export default app;

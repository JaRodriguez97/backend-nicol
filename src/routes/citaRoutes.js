import express from "express";
import {
  crearCita,
  obtenerMisCitas,
  obtenerTodasLasCitas,
  actualizarCita,
  eliminarCita,
  obtenerCitasPorCelular,
} from "../controllers/citaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { validarDatosCita, validarIdCita, validarEstadoCita, validarCelular } from "../middlewares/citaValidation.js";
import { citaLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/", citaLimiter, validarDatosCita, crearCita); // Crear cita con validación y rate limiting
router.get("/celular/:celular", validarCelular, obtenerCitasPorCelular); // Consulta de citas por celular

// Rutas protegidas para usuarios autenticados
router.get("/mis-citas", authMiddleware, obtenerMisCitas);
router.put("/:id", authMiddleware, validarIdCita, validarEstadoCita, actualizarCita);
router.delete("/:id", authMiddleware, validarIdCita, eliminarCita);

// Rutas solo para administradores
router.get("/", authMiddleware, adminMiddleware, obtenerTodasLasCitas);

export default router;

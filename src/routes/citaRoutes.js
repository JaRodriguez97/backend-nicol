import express from "express";
import {
  crearCita,
  obtenerMisCitas,
  obtenerTodasLasCitas,
  actualizarCita,
  eliminarCita,
  obtenerCitasPorCelular,
  obtenerHorariosDisponibles,
} from "../controllers/citaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { validarDatosCita, validarIdCita, validarEstadoCita, validarCelular } from "../middlewares/citaValidation.js";
import { citaLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/", citaLimiter, validarDatosCita, crearCita); // Crear cita con validación y rate limiting
router.get("/celular/:celular", validarCelular, obtenerCitasPorCelular); // Consulta de citas por celular
router.get("/disponibilidad", obtenerHorariosDisponibles); // Consultar horarios disponibles por fecha
router.put("/publica/:id", validarIdCita, validarEstadoCita, actualizarCita); // Actualizar cita pública (solo por celular)

// Rutas protegidas para usuarios autenticados
router.get("/mis-citas", authMiddleware, obtenerMisCitas);
router.delete("/:id", authMiddleware, validarIdCita, eliminarCita);

// Rutas solo para administradores
router.get("/", authMiddleware, adminMiddleware, obtenerTodasLasCitas);
router.put("/admin/:id", authMiddleware, adminMiddleware, validarIdCita, validarEstadoCita, actualizarCita); // Actualizar cita como admin

export default router;

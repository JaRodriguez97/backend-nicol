import express from "express";
import {
  crearServicio,
  obtenerServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { validarDatosServicio, validarIdServicio } from "../middlewares/servicioValidation.js";

const router = express.Router();

// Rutas públicas
router.get("/", obtenerServicios); // Listado de servicios disponible para todos

// Rutas protegidas para consulta
router.get("/:id", validarIdServicio, obtenerServicio);

// Rutas solo para administradores
router.post("/", authMiddleware, adminMiddleware, validarDatosServicio, crearServicio);
router.put("/:id", authMiddleware, adminMiddleware, validarIdServicio, validarDatosServicio, actualizarServicio);
router.delete("/:id", authMiddleware, adminMiddleware, validarIdServicio, eliminarServicio);

export default router;

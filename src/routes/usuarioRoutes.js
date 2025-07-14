import express from "express";
import {
  loginUsuario,
  obtenerPerfil,
  listarUsuarios,
} from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { validarLogin } from "../middlewares/usuarioValidation.js";
import { loginLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/login", loginLimiter, validarLogin, loginUsuario);

// Rutas protegidas para usuarios autenticados
router.get("/me", authMiddleware, obtenerPerfil);

// Rutas solo para administradores
router.get("/", authMiddleware, adminMiddleware, listarUsuarios);

export default router;

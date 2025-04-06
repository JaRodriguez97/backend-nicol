import express from "express";
import {
  // registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  listarUsuarios,
} from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/me", authMiddleware, obtenerPerfil);
router.get("/", authMiddleware, listarUsuarios);

export default router;

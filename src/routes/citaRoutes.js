import express from "express";
import {
  crearCita,
  obtenerMisCitas,
  obtenerTodasLasCitas,
  actualizarCita,
  eliminarCita,
} from "../controllers/citaController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", crearCita);
router.get("/mis-citas", authMiddleware, obtenerMisCitas);
router.get("/", authMiddleware, obtenerTodasLasCitas);
router.put("/:id", authMiddleware, actualizarCita);
router.delete("/:id", authMiddleware, eliminarCita);

export default router;

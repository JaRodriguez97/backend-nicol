import express from "express";
import {
  crearServicio,
  obtenerServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", crearServicio);
router.get("/", obtenerServicios);
router.get("/:id", authMiddleware, obtenerServicio);
router.put("/:id", authMiddleware, actualizarServicio);
router.delete("/:id", authMiddleware, eliminarServicio);

export default router;

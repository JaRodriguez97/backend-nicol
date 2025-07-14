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

const router = express.Router();

router.post("/", crearCita);
router.get("/mis-citas", obtenerMisCitas);
router.get("/celular/:celular", obtenerCitasPorCelular); // Ruta pública para consultar citas por celular
router.get("/", authMiddleware, obtenerTodasLasCitas);
router.put("/:id", authMiddleware, actualizarCita);
router.delete("/:id", authMiddleware, eliminarCita);

export default router;

import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";

// Crear una nueva cita
export const crearCita = async (req, res) => {
  try {
    const {
      celular,
      fecha,
      hora,
      servicio,
      duracion,
      precio,
      estado = "Pendiente",
    } = req.body;
    console.log("🚀 ~ crearCita ~ req.body:", req.body);
    // const usuarioId = req.usuario.id;
    return res.status(201).json({ mensaje: "Cita creada con éxito" });
    const citaExistente = await Cita.findOne({ fecha, hora });

    if (citaExistente)
      return res.status(400).json({
        mensaje:
          citaExistente.celular == celular
            ? "Usted ya tiene una cita en esa hora y fecha, se encuentra en estado: " +
              citaExistente.estado
            : "Alguien mas ya tiene una cita en esa hora y fecha",
      });

    const cita = new Cita({
      celular,
      fecha,
      hora,
      servicio,
      duracion,
      precio,
      estado,
    });
    await cita.save();

    res.status(201).json({ mensaje: "Cita creada con éxito", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener citas del usuario autenticado
export const obtenerMisCitas = async (req, res) => {
  try {
    const citas = await Cita.find({ usuario: req.usuario.id });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener todas las citas (solo admin)
export const obtenerTodasLasCitas = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin")
      return res.status(403).json({ mensaje: "Acceso denegado" });

    let $project = {
      _id: 1,
      celular: 1,
      estado: 1,
      fecha: 1,
      historial: 1,
      hora: 1,
      servicio: {
        $map: {
          input: "$servicio",
          as: "s",
          in: {
            categoria: "$$s.categoria",
            duracion: "$$s.duracion",
            nombre: "$$s.nombre",
            precio: "$$s.precio",
            _id: "$$s._id",
          },
        },
      },
    };

    const citas = await Cita.aggregate([
      { $match: { estado: { $ne: "Pendiente" } } },
      {
        $lookup: {
          from: "servicios", // Nombre de la colección en MongoDB
          localField: "servicio", // Campo en "Cita" que referencia a "Servicio"
          foreignField: "_id", // Campo _id en "Servicio"
          as: "servicio", // Nombre del campo resultante
        },
      },
      { $project },
    ]);

    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Actualizar estado de una cita (solo admin)
export const actualizarCita = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin")
      return res.status(403).json({ mensaje: "Acceso denegado" });
    const { estado } = req.body;
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!cita) return res.status(404).json({ mensaje: "Cita no encontrada" });
    res.json({ mensaje: "Cita actualizada", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Eliminar una cita
export const eliminarCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ mensaje: "Cita no encontrada" });

    if (
      req.usuario.rol !== "admin" &&
      cita.usuario.toString() !== req.usuario.id
    ) {
      return res.status(403).json({ mensaje: "Acceso denegado" });
    }

    await cita.deleteOne();
    res.json({ mensaje: "Cita eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

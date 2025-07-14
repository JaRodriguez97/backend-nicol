import {
  verificarCitaExistente,
  obtenerCitaPorId,
  crearNuevaCita,
  obtenerCitasUsuario,
  obtenerTodasCitas,
  obtenerCitasPorCelularService,
  actualizarEstadoCita,
  eliminarCitaService,
  verificarPermisosCita
} from "../services/citaService.js";

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
    const citaExistente = await verificarCitaExistente(fecha, hora);

    if (citaExistente)
      return res.status(400).json({
        mensaje:
          citaExistente.celular == celular
            ? "Usted ya tiene una cita en esa hora y fecha, se encuentra en estado: " +
              citaExistente.estado
            : "Alguien más ya tiene una cita en esa hora y fecha",
      });

    const cita = await crearNuevaCita({
      celular,
      fecha,
      hora,
      servicio,
      duracion,
      precio,
      estado,
      historial: [{ estado }],
    });

    res.status(201).json({ mensaje: "Cita creada con éxito", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener citas del usuario autenticado
export const obtenerMisCitas = async (req, res) => {
  try {
    const citas = await obtenerCitasUsuario(req.usuario.id);
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

    const citas = await obtenerTodasCitas();

    console.log("🚀 ~ obtenerTodasLasCitas ~ citas:", citas.length);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener citas por número de celular (pública)
export const obtenerCitasPorCelular = async (req, res) => {
  try {
    const { celular } = req.params;

    if (!celular || !/^[3]{1}[0-9]{9}$/.test(celular)) {
      return res.status(400).json({ mensaje: "Número de celular inválido" });
    }

    const citas = await obtenerCitasPorCelularService(celular);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Actualizar estado de una cita (cualquier usuario puede actualizar sus propias citas, admin puede actualizar todas)
export const actualizarCita = async (req, res) => {
  try {
    const { estado } = req.body;
    const citaId = req.params.id;
    const usuarioCelular = req.body.celular; // Para verificar si la cita pertenece al usuario por su número celular

    // Verificar que la cita existe
    const citaExistente = await obtenerCitaPorId(citaId);
    if (!citaExistente)
      return res.status(404).json({ mensaje: "Cita no encontrada" });

    // Verificar permisos: admin puede editar cualquier cita, usuario normal solo las suyas por número de celular
    const esAdmin = req.usuario?.rol === "admin";
    const esCitaDelUsuario = usuarioCelular && citaExistente.celular.toString() === usuarioCelular.toString();
    
    if (!esAdmin && !esCitaDelUsuario) {
      return res.status(403).json({ mensaje: "No tienes permiso para actualizar esta cita" });
    }

    // Verificar que el estado es diferente al actual
    if (citaExistente.estado === estado) {
      return res.json({
        mensaje: "La cita ya tiene ese estado",
        cita: citaExistente,
      });
    }

    // Actualizar estado de la cita
    const cita = await actualizarEstadoCita(citaId, estado);

    res.json({ mensaje: "Cita actualizada con éxito", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Eliminar una cita (solo admin) o cancelarla (cualquier usuario con su celular)
export const eliminarCita = async (req, res) => {
  try {
    const citaId = req.params.id;
    const usuarioCelular = req.body.celular;
    const esAdmin = req.usuario?.rol === "admin";
    
    // Verificar que la cita existe
    const citaExistente = await obtenerCitaPorId(citaId);
    if (!citaExistente) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }
    
    // Verificar si es la cita del usuario que intenta cancelar
    const esCitaDelUsuario = usuarioCelular && citaExistente.celular.toString() === usuarioCelular.toString();
    
    // Si no es admin ni el dueño de la cita, denegar acceso
    if (!esAdmin && !esCitaDelUsuario) {
      return res.status(403).json({ mensaje: "No tienes permiso para cancelar esta cita" });
    }
    
    // Lógica según el tipo de usuario
    if (esAdmin) {
      // Los admin pueden eliminar físicamente
      const eliminado = await eliminarCitaService(citaId);
      if (!eliminado) {
        return res.status(500).json({ mensaje: "Error al eliminar la cita" });
      }
      return res.json({ mensaje: "Cita eliminada permanentemente" });
    } else {
      // Las clientas solo pueden cancelar (cambio de estado)
      const estadoCancelacion = "Cancelada por clienta";
      const cita = await actualizarEstadoCita(citaId, estadoCancelacion);
      return res.json({ 
        mensaje: "Cita cancelada correctamente", 
        cita
      });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

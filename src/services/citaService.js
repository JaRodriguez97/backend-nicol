import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";

/**
 * Valida si una cita existe en una fecha y hora específica
 * @param {string} fecha - Fecha de la cita
 * @param {string} hora - Hora de la cita
 * @returns {Promise<Object|null>} Cita existente o null
 */
export const verificarCitaExistente = async (fecha, hora) => {
  return await Cita.findOne({ fecha, hora });
};

/**
 * Busca una cita por su ID
 * @param {string} citaId - ID de la cita
 * @returns {Promise<Object|null>} Cita encontrada o null
 */
export const obtenerCitaPorId = async (citaId) => {
  return await Cita.findById(citaId);
};

/**
 * Crea una nueva cita en la base de datos
 * @param {Object} dataCita - Datos de la cita a crear
 * @returns {Promise<Object>} Cita creada
 */
export const crearNuevaCita = async (dataCita) => {
  const cita = new Cita(dataCita);
  return await cita.save();
};

/**
 * Obtiene las citas de un usuario específico
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de citas del usuario
 */
export const obtenerCitasUsuario = async (usuarioId) => {
  return await Cita.find({ usuario: usuarioId });
};

/**
 * Obtiene todas las citas con información de servicios
 * @returns {Promise<Array>} Lista de todas las citas
 */
export const obtenerTodasCitas = async () => {
  const projectStage = {
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

  return await Cita.aggregate([
    { $match: { estado: { $ne: "Pendiente" } } },
    {
      $lookup: {
        from: "servicios",
        localField: "servicio",
        foreignField: "_id",
        as: "servicio",
      },
    },
    { $project: projectStage },
    { $sort: { fecha: 1, hora: 1 } },
  ]);
};

/**
 * Obtiene citas por número de celular
 * @param {number} celular - Número de celular
 * @returns {Promise<Array>} Lista de citas asociadas al celular
 */
export const obtenerCitasPorCelularService = async (celular) => {
  const projectStage = {
    _id: 1,
    celular: 1,
    estado: 1,
    fecha: 1,
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

  return await Cita.aggregate([
    { $match: { celular: Number(celular) } },
    {
      $lookup: {
        from: "servicios",
        localField: "servicio",
        foreignField: "_id",
        as: "servicio",
      },
    },
    { $project: projectStage },
    { $sort: { fecha: 1, hora: 1 } },
  ]);
};

/**
 * Actualiza el estado de una cita
 * @param {string} citaId - ID de la cita
 * @param {string} nuevoEstado - Nuevo estado de la cita
 * @returns {Promise<Object|null>} Cita actualizada o null si no existe
 */
export const actualizarEstadoCita = async (citaId, nuevoEstado) => {
  return await Cita.findByIdAndUpdate(
    citaId,
    {
      estado: nuevoEstado,
      $push: { historial: { estado: nuevoEstado, fecha: new Date() } },
    },
    { new: true }
  );
};

/**
 * Elimina una cita por su ID
 * @param {string} citaId - ID de la cita a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const eliminarCitaService = async (citaId) => {
  const cita = await Cita.findById(citaId);
  if (!cita) return false;
  
  await cita.deleteOne();
  return true;
};

/**
 * Verifica si un usuario tiene permisos sobre una cita
 * @param {string} citaId - ID de la cita
 * @param {string} usuarioId - ID del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Promise<boolean>} true si tiene permisos
 */
export const verificarPermisosCita = async (citaId, usuarioId, rol) => {
  const cita = await Cita.findById(citaId);
  if (!cita) return false;
  
  // Admin siempre tiene permiso
  if (rol === "admin") return true;
  
  // Usuario normal solo si es su cita
  return cita.usuario && cita.usuario.toString() === usuarioId;
};

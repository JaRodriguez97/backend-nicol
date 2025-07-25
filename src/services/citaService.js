import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";
import {
  convertirHoraAMinutos,
  validarTiempoSuficiente,
} from "../utils/timeUtils.js";
import mongoose from "mongoose";

/**
 * Valida si una cita se superpone con citas existentes considerando la duración
 * @param {string} fecha - Fecha de la cita (formato YYYY-MM-DD)
 * @param {string} hora - Hora de la cita (formato HH:MM AM/PM)
 * @param {number} duracionTotal - Duración total de la cita en minutos
 * @param {string} excluirCitaId - ID de cita a excluir de la verificación (para actualizaciones)
 * @returns {Promise<Object|null>} Cita existente que causa conflicto o null
 */
export const verificarCitaExistente = async (
  fecha,
  hora,
  duracionTotal,
  excluirCitaId = null
) => {
  // Permitir agendamiento a las 5:30 PM sin restricción de duración
  const es530PM = hora === "5:30 PM";

  // Validar que la cita esté dentro del horario laboral
  // EXCEPCIÓN: Si es 5:30 PM, omitir validación de tiempo suficiente
  if (!es530PM) {
    const validacionHorario = validarTiempoSuficiente(hora, duracionTotal);
    if (!validacionHorario.exito) {
      // Retornar un objeto especial para indicar error de horario laboral
      return {
        esErrorHorarioLaboral: true,
        mensaje: validacionHorario.mensaje,
      };
    }
  }

  // Construir filtros para obtener citas del día
  const filtros = {
    fecha,
    estado: {
      $nin: ["Cancelada por clienta", "Cancelada por salón", "No asistió"],
    },
  };
  
  // Excluir la cita actual si se especifica (para actualizaciones)
  if (excluirCitaId) {
    filtros._id = { $ne: new mongoose.Types.ObjectId(excluirCitaId) };
  }
  
  console.log("🚀 ~ verificarCitaExistente ~ filtros:", filtros)

  // Obtener todas las citas en la misma fecha (excluyendo las canceladas y la cita actual si aplica)
  const citasDelDia = await Cita.find(filtros);

  if (citasDelDia.length === 0) {
    return null; // No hay citas ese día
  }

  // Convertir hora de texto a formato 24 horas para cálculos

  const inicioNuevaCita = convertirHoraAMinutos(hora);
  const finNuevaCita = inicioNuevaCita + duracionTotal;

  // Verificar conflictos con cada cita existente
  for (const cita of citasDelDia) {
    const inicioCitaExistente = convertirHoraAMinutos(cita.hora);
    const finCitaExistente = inicioCitaExistente + cita.duracionTotal;

    // Verificar si hay superposición
    // Una cita se superpone solo si:
    // - Comienza antes de que termine la existente Y termina después de que comience la existente
    // - Pero NO si comienza exactamente cuando termina la otra (11:30 después de 11:00-11:30)
    // - Y NO si termina exactamente cuando comienza la otra (10:30 antes de 10:30-11:00)
    const haySuperposicion =
      inicioNuevaCita < finCitaExistente && finNuevaCita > inicioCitaExistente;

    if (haySuperposicion) {
      return cita; // Retornar la cita que causa conflicto
    }
  }

  return null; // No hay conflicto
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
  const $project = {
    _id: 1,
    celular: 1,
    estado: 1,
    fecha: 1,
    hora: 1,
    duracionTotal: 1,
    precioTotal: 1,
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
    { $project },
    { $sort: { fecha: 1, hora: 1 } },
  ]);
};

/**
 * Obtiene todas las citas para una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de citas en esa fecha
 */
export const obtenerCitasPorFecha = async (fecha) => {
  return await Cita.find({
    fecha: fecha,
    estado: {
      $nin: ["Cancelada por clienta", "Cancelada por salón", "No asistió"],
    }, // Excluir citas canceladas
  })
    .select("hora duracionTotal estado celular")
    .sort({ hora: 1 });
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
 * Actualiza la fecha y hora de una cita
 * @param {string} citaId - ID de la cita
 * @param {string} nuevaFecha - Nueva fecha de la cita
 * @param {string} nuevaHora - Nueva hora de la cita
 * @returns {Promise<Object|null>} Cita actualizada o null si no existe
 */
export const actualizarFechaHoraCita = async (
  citaId,
  nuevaFecha,
  nuevaHora
) => {
  return await Cita.findByIdAndUpdate(
    citaId,
    { fecha: nuevaFecha, hora: nuevaHora },
    { new: true }
  );
};

/**
 * Actualiza una cita completa incluyendo servicios, duración y precio
 * @param {string} citaId - ID de la cita
 * @param {Object} datosActualizacion - Datos a actualizar
 * @returns {Promise<Object|null>} Cita actualizada o null si no existe
 */
export const actualizarCitaCompleta = async (citaId, datosActualizacion) => {
  const actualizacion = {
    ...datosActualizacion,
    $push: { historial: { estado: datosActualizacion.estado || 'Pendiente', fecha: new Date() } }
  };
  
  return await Cita.findByIdAndUpdate(
    citaId,
    actualizacion,
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

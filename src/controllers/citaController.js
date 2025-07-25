import {
  verificarCitaExistente,
  obtenerCitaPorId,
  crearNuevaCita,
  obtenerCitasUsuario,
  obtenerTodasCitas,
  obtenerCitasPorCelularService,
  actualizarEstadoCita,
  actualizarFechaHoraCita,
  actualizarCitaCompleta,
  eliminarCitaService,
  verificarPermisosCita,
} from "../services/citaService.js";
import {
  convertirHoraAMinutos,
  convertirMinutosAHora,
  generarHorariosPosibles,
  validarTiempoSuficiente,
} from "../utils/timeUtils.js";

// Crear una nueva cita
export const crearCita = async (req, res) => {
  try {
    const {
      celular,
      fecha,
      hora,
      servicio,
      duracionTotal,
      precioTotal,
      estado = "Pendiente",
    } = req.body;

    // Validar que duracionTotal sea válida
    if (!duracionTotal || duracionTotal <= 0) {
      return res.status(400).json({
        mensaje: "La duración total debe ser mayor a 0 minutos",
      });
    }

    // Verificar conflictos de horario considerando duración
    const citaExistente = await verificarCitaExistente(
      fecha,
      hora,
      duracionTotal
    );

    if (citaExistente) {
      // Manejar error de horario laboral
      if (citaExistente.esErrorHorarioLaboral) {
        return res.status(400).json({
          mensaje: citaExistente.mensaje,
        });
      }

      // Calcular hora de fin de la cita existente usando utilidades centralizadas
      const inicioExistente = convertirHoraAMinutos(citaExistente.hora);
      const finExistente = inicioExistente + citaExistente.duracionTotal;
      const horaFinFormateada = convertirMinutosAHora(finExistente);

      return res.status(400).json({
        mensaje:
          citaExistente.celular == celular
            ? `Ya tienes una cita agendada que se cruza con este horario. Tu cita actual es de ${citaExistente.hora} a ${horaFinFormateada} y está ${citaExistente.estado.toLowerCase()}.`
            : `Este horario ya está ocupado por otra cita (${citaExistente.hora} a ${horaFinFormateada}). Por favor elige otro horario.`,
        conflicto: {
          horaInicio: citaExistente.hora,
          horaFin: horaFinFormateada,
          duracion: citaExistente.duracionTotal,
          esCitaPropia: citaExistente.celular == celular,
          estadoCita: citaExistente.estado
        },
        codigo: 'HORARIO_OCUPADO',
        esErrorUsuario: true
      });
    }

    const cita = await crearNuevaCita({
      celular,
      fecha,
      hora,
      servicio,
      duracionTotal,
      precioTotal,
      estado,
      historial: [{ estado }],
    });

    res.status(201).json({ mensaje: "Cita creada con éxito", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

  // Obtener horarios disponibles para una fecha específica
export const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { fecha, duracion, excluirCitaId } = req.query;
    const duracionServicio = parseInt(duracion) || 60; // Default 60 minutos si no se especifica

    if (!fecha) {
      return res.status(400).json({ mensaje: "La fecha es requerida" });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res
        .status(400)
        .json({ mensaje: "La fecha debe tener el formato YYYY-MM-DD" });
    }

    // Verificar que la fecha no sea anterior a hoy
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      return res
        .status(400)
        .json({ mensaje: "La fecha no puede ser anterior a hoy" });
    }

    // Obtener todas las citas para esa fecha
    const { obtenerCitasPorFecha } = await import("../services/citaService.js");
    let citasDelDia = await obtenerCitasPorFecha(fecha);

    // Si se está editando una cita, excluirla de la lista de citas ocupadas
    if (excluirCitaId) {
      citasDelDia = citasDelDia.filter(
        (cita) => cita._id.toString() !== excluirCitaId.toString()
      );
    }

    // Generar todos los horarios posibles usando utilidades centralizadas
    const horariosPosibles = generarHorariosPosibles();

    // Filtrar horarios ocupados considerando la duración específica del servicio solicitado
    const horariosDisponibles = horariosPosibles.filter((horario) => {
      const inicioHorario = convertirHoraAMinutos(horario);
      const finHorario = inicioHorario + duracionServicio;

      // Permitir agendamiento a las 5:30 PM sin restricción de duración
      const es530PM = horario === "5:30 PM";

      // Verificar que el horario completo (inicio + duración) esté dentro del horario laboral
      // EXCEPCIÓN: Si es 5:30 PM, permitir sin validar tiempo suficiente
      if (!es530PM) {
        const validacionHorario = validarTiempoSuficiente(
          horario,
          duracionServicio
        );
        if (!validacionHorario.exito) {
          return false;
        }
      }

      // Verificar si este horario se solapa con alguna cita existente
      // IMPORTANTE: Usar la duración de cada cita existente, no la nueva duración
      return !citasDelDia.some((cita) => {
        const inicioCita = convertirHoraAMinutos(cita.hora);
        const finCita = inicioCita + cita.duracionTotal; // Usar duración original de la cita existente

        // Se considera solapamiento si hay intersección entre los rangos de tiempo
        // La nueva cita (con su nueva duración) vs cada cita existente (con su duración original)
        // Pero NO si una cita termina exactamente cuando comienza la otra
        return inicioHorario < finCita && finHorario > inicioCita;
      });
    });

    res.json({
      fecha,
      duracionConsiderada: duracionServicio,
      horariosDisponibles,
      totalDisponibles: horariosDisponibles.length,
      citasExistentes: citasDelDia.length,
    });
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
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

// Actualizar estado de una cita - Ruta pública (solo por celular)
export const actualizarCita = async (req, res) => {
  try {
    const { estado, celular, fecha, hora, servicio, duracionTotal, precioTotal } = req.body;
    const citaId = req.params.id;
    const esRutaPublica = req.route.path.includes("/publica/");

    // Verificar que la cita existe
    const citaExistente = await obtenerCitaPorId(citaId);
    if (!citaExistente)
      return res.status(404).json({ mensaje: "Cita no encontrada" });

    // Lógica de permisos según el tipo de ruta
    if (esRutaPublica) {
      // Ruta pública: solo se puede actualizar con el celular correcto
      if (!celular) {
        return res.status(400).json({
          mensaje: "El número de celular es requerido para actualizar la cita",
        });
      }

      if (citaExistente.celular.toString() !== celular.toString()) {
        return res
          .status(403)
          .json({ mensaje: "No tienes permiso para actualizar esta cita" });
      }
    } else {
      // Ruta admin: verificar que sea admin
      const esAdmin = req.usuario?.rol === "admin";
      if (!esAdmin) {
        return res
          .status(403)
          .json({ mensaje: "Solo los administradores pueden usar esta ruta" });
      }
    }

    // Si se proporcionan servicios, duración o precio, hacer actualización completa
    if (servicio || duracionTotal || precioTotal || fecha || hora) {
      const nuevaFecha = fecha || citaExistente.fecha;
      const nuevaHora = hora || citaExistente.hora;
      const nuevaDuracion = duracionTotal || citaExistente.duracionTotal;
      const nuevoPrecio = precioTotal || citaExistente.precioTotal;
      const nuevosServicios = servicio || citaExistente.servicio;
      
      // Validar que la nueva duración sea válida
      if (nuevaDuracion <= 0) {
        return res.status(400).json({
          mensaje: "La duración total debe ser mayor a 0 minutos",
        });
      }

      // SIEMPRE validar conflictos cuando hay cambios en servicios, duración, fecha u hora
      // Esto es crucial para detectar solapamientos cuando se aumenta la duración
      if (
        nuevaFecha !== citaExistente.fecha ||
        nuevaHora !== citaExistente.hora ||
        nuevaDuracion !== citaExistente.duracionTotal
      ) {        
        // Verificar conflictos excluyendo la cita actual y usando la nueva duración
        const conflicto = await verificarCitaExistente(
          nuevaFecha,
          nuevaHora,
          nuevaDuracion, // IMPORTANTE: Usar la nueva duración para detectar solapamientos
          citaId
        );

        if (conflicto) {
          // Manejar error de horario laboral
          if (conflicto.esErrorHorarioLaboral) {
            return res.status(400).json({
              mensaje: conflicto.mensaje,
            });
          }

          // Usar utilidades centralizadas para conversiones de hora
          const inicioConflicto = convertirHoraAMinutos(conflicto.hora);
          const finConflicto = inicioConflicto + conflicto.duracionTotal;
          const horaFinFormateada = convertirMinutosAHora(finConflicto);

          return res.status(400).json({
            mensaje: `No se puede reprogramar la cita. Este horario ya está ocupado por otra cita (${conflicto.hora} a ${horaFinFormateada}). Por favor elige otro horario.`,
            conflicto: {
              horaInicio: conflicto.hora,
              horaFin: horaFinFormateada,
              duracion: conflicto.duracionTotal,
              esCitaPropia: conflicto.celular && conflicto.celular.toString() === celular?.toString(),
              estadoCita: conflicto.estado
            },
            codigo: 'HORARIO_OCUPADO_ACTUALIZACION',
            esErrorUsuario: true,
            contexto: 'Al agregar más servicios o cambiar el horario, se necesita más tiempo y puede generar conflictos con otras citas.'
          });
        }
      }

      // Preparar datos para actualización completa
      const datosActualizacion = {
        fecha: nuevaFecha,
        hora: nuevaHora,
        servicio: nuevosServicios,
        duracionTotal: nuevaDuracion,
        precioTotal: nuevoPrecio,
        estado: estado || 'Pendiente' // Al modificar servicios, vuelve a pendiente
      };

      // Actualizar cita completa
      const citaActualizada = await actualizarCitaCompleta(citaId, datosActualizacion);

      return res.json({
        mensaje: "Cita actualizada con éxito",
        cita: citaActualizada,
      });
    }

    // Si solo se actualiza el estado
    if (estado) {
      // Verificar que el estado es diferente al actual
      if (citaExistente.estado === estado) {
        return res.json({
          mensaje: "La cita ya tiene ese estado",
          cita: citaExistente,
        });
      }

      // Actualizar estado de la cita
      const cita = await actualizarEstadoCita(citaId, estado);
      return res.json({ mensaje: "Cita actualizada con éxito", cita });
    }

    // Si no se especifica qué actualizar
    return res.status(400).json({
      mensaje: "Debe especificar qué actualizar (estado, fecha, hora)",
    });
  } catch (error) {
    console.error('Error en actualizarCita:', error);
    
    // Si el error ya tiene un status definido, respetarlo
    if (error.status && error.message) {
      return res.status(error.status).json({
        mensaje: error.message,
        ...(error.data || {})
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({ 
      mensaje: "Error en el servidor", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      esErrorUsuario: false
    });
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
    const esCitaDelUsuario =
      usuarioCelular &&
      citaExistente.celular.toString() === usuarioCelular.toString();

    // Si no es admin ni el dueño de la cita, denegar acceso
    if (!esAdmin && !esCitaDelUsuario) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para cancelar esta cita" });
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
        cita,
      });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

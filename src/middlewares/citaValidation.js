/**
 * Middleware para validar los datos de una cita antes de crear o actualizar
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarDatosCita = (req, res, next) => {
  const { celular, fecha, hora, servicio, duracionTotal, precioTotal } = req.body;
  const errores = [];

  // Validar celular (debe ser un número de 10 dígitos que comienza por 3)
  if (!celular) {
    errores.push("El número de celular es obligatorio");
  } else if (!/^[3]{1}[0-9]{9}$/.test(celular.toString())) {
    errores.push("El número de celular debe comenzar por 3 y tener 10 dígitos");
  }

  // Validar fecha (formato YYYY-MM-DD)
  if (!fecha) {
    errores.push("La fecha es obligatoria");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    errores.push("La fecha debe tener el formato YYYY-MM-DD");
  } else {
    // Verificar que la fecha no sea anterior a hoy
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

    if (fechaCita < hoy) {
      errores.push("La fecha de la cita no puede ser anterior a hoy");
    }
  }

  // Validar hora (formato HH:MM AM/PM)
  if (!hora) {
    errores.push("La hora es obligatoria");
  } else if (!/^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i.test(hora)) {
    errores.push("La hora debe tener el formato HH:MM AM/PM (ejemplo: 10:00 AM, 02:30 PM)");
  }

  // Validar servicio
  if (!servicio) {
    errores.push("Debe seleccionar al menos un servicio");
  } else if (!Array.isArray(servicio) && !servicio._id) {
    errores.push("Formato de servicio inválido");
  }

  // Validar duracionTotal
  if (!duracionTotal) {
    errores.push("La duración total es obligatoria");
  } else if (typeof duracionTotal !== 'number' || duracionTotal <= 0) {
    errores.push("La duración total debe ser un número positivo");
  }

  // Validar precioTotal
  if (!precioTotal) {
    errores.push("El precio total es obligatorio");
  } else if (typeof precioTotal !== 'number' || precioTotal <= 0) {
    errores.push("El precio total debe ser un número positivo");
  }

  // Si hay errores, devolver respuesta con errores
  if (errores.length > 0) {
    return res.status(400).json({ 
      mensaje: "Datos de cita inválidos", 
      errores 
    });
  }

  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar el ID de una cita
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarIdCita = (req, res, next) => {
  const { id } = req.params;
  
  // Validar que el ID tenga el formato correcto de MongoDB
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      mensaje: "ID de cita inválido"
    });
  }

  next();
};

/**
 * Middleware para validar el estado de una cita
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarEstadoCita = (req, res, next) => {
  const { estado } = req.body;
  const estadosValidos = [
    "Pendiente",
    "Aprobada",
    "Notificada",
    "En progreso",
    "Completada",
    "Cancelada por clienta",
    "Cancelada por salón",
    "No asistió"
  ];

  if (!estado) {
    return res.status(400).json({ 
      mensaje: "El estado de la cita es obligatorio" 
    });
  }

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ 
      mensaje: "Estado de cita inválido",
      estadosValidos
    });
  }

  next();
};

/**
 * Middleware para validar número de celular
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarCelular = (req, res, next) => {
  const { celular } = req.params;
  
  if (!celular || !/^[3]{1}[0-9]{9}$/.test(celular)) {
    return res.status(400).json({ 
      mensaje: "Número de celular inválido. Debe comenzar por 3 y tener 10 dígitos" 
    });
  }

  next();
};

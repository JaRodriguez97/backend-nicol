/**
 * Middleware para validar los datos de inicio de sesión
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarLogin = (req, res, next) => {
  const { celular, password } = req.body;
  const errores = [];

  // Validar celular
  if (!celular) {
    errores.push("El número de celular es obligatorio");
  } else if (!/^[3]{1}[0-9]{9}$/.test(celular.toString())) {
    errores.push("El número de celular debe comenzar por 3 y tener 10 dígitos");
  }

  // Validar contraseña
  if (!password) {
    errores.push("La contraseña es obligatoria");
  } else if (password.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres");
  }

  // Si hay errores, devolver respuesta con errores
  if (errores.length > 0) {
    return res.status(400).json({ 
      mensaje: "Datos de inicio de sesión inválidos", 
      errores 
    });
  }

  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar los datos de registro de usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarRegistro = (req, res, next) => {
  const { celular, nombre, password, rol } = req.body;
  const errores = [];

  // Validar celular
  if (!celular) {
    errores.push("El número de celular es obligatorio");
  } else if (!/^[3]{1}[0-9]{9}$/.test(celular.toString())) {
    errores.push("El número de celular debe comenzar por 3 y tener 10 dígitos");
  }

  // Validar nombre
  if (!nombre) {
    errores.push("El nombre es obligatorio");
  } else if (nombre.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres");
  }

  // Validar contraseña
  if (!password) {
    errores.push("La contraseña es obligatoria");
  } else if (password.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres");
  }

  // Validar rol
  if (rol && !["admin", "cliente"].includes(rol)) {
    errores.push("El rol debe ser 'admin' o 'cliente'");
  }

  // Si hay errores, devolver respuesta con errores
  if (errores.length > 0) {
    return res.status(400).json({ 
      mensaje: "Datos de registro inválidos", 
      errores 
    });
  }

  // Si todo está bien, continuar
  next();
};

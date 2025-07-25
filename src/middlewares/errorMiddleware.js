/**
 * Middleware para manejar errores 404 (rutas no encontradas)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware para manejar errores generales
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error middleware triggered:', {
    message: err.message,
    status: err.status,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(err);
  }

  // Determinar el status code apropiado
  let statusCode = err.status || err.statusCode || 500;
  if (statusCode === 200) statusCode = 500;
  
  // Determinar mensaje de error y detalles según entorno
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Estructura base de respuesta
  const errorResponse = {
    mensaje: err.message || 'Error interno del servidor',
    error: true,
    esErrorUsuario: err.esErrorUsuario || false
  };

  // Agregar información adicional si existe
  if (err.codigo) errorResponse.codigo = err.codigo;
  if (err.conflicto) errorResponse.conflicto = err.conflicto;
  if (err.contexto) errorResponse.contexto = err.contexto;
  
  // Solo mostrar stack trace en desarrollo
  if (isDevelopment) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

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
  // Si el status code sigue siendo 200, cambiarlo a 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  // Determinar mensaje de error y detalles según entorno
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // En producción no devolvemos el stack trace
  res.json({
    mensaje: err.message,
    stack: isDevelopment ? err.stack : null,
    error: true
  });
};

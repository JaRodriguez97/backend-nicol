import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware que verifica si el usuario es administrador
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const adminMiddleware = (req, res, next) => {
  // Verificar que el usuario esté autenticado
  if (!req.usuario) {
    return res.status(401).json({ mensaje: "Autenticación requerida" });
  }

  // Verificar que el usuario tenga rol de administrador
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      mensaje: "Acceso denegado. Se requieren permisos de administrador" 
    });
  }

  // Si todo está bien, continuar
  next();
};

export default adminMiddleware;

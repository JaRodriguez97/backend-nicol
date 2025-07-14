import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware de autenticación que verifica tokens JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authMiddleware = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ mensaje: "Acceso denegado. Se requiere token de autenticación" });
  }

  // Manejar formatos 'Bearer token' o solo 'token'
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar los datos del usuario en el request para uso en rutas protegidas
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "El token ha expirado. Inicie sesión nuevamente" });
    }
    
    res.status(401).json({ mensaje: "Token inválido o manipulado" });
  }
};

export default authMiddleware;

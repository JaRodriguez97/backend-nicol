import rateLimit from 'express-rate-limit';

// Función para crear limitador que se deshabilita en tests
const createLimiter = (config) => {
  if (process.env.NODE_ENV === 'test') {
    // En pruebas, usar límites mucho más altos
    return rateLimit({
      ...config,
      max: 1000, // Límite muy alto para tests
      windowMs: 1000 // Ventana muy pequeña para tests
    });
  }
  return rateLimit(config);
};

/**
 * Middleware general para limitar solicitudes a la API
 * 100 solicitudes por IP cada 15 minutos
 */
export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 solicitudes por ventana
  standardHeaders: true, // Devuelve información rate limit en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  message: {
    mensaje: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos'
  }
});

/**
 * Middleware para limitar solicitudes de inicio de sesión
 * 5 intentos por IP cada 15 minutos
 */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo después de 15 minutos'
  }
});

/**
 * Middleware para limitar solicitudes de creación de citas
 * 10 citas por IP cada hora
 */
export const citaLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 citas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiadas citas creadas, por favor intente de nuevo después de 1 hora'
  }
});

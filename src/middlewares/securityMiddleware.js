import helmet from 'helmet';
import cors from 'cors';

/**
 * Configuración del middleware Helmet para proteger cabeceras HTTP
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});

/**
 * Configuración de CORS
 */
export const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // En producción, especificar dominios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

/**
 * Middleware para establecer encabezados de seguridad adicionales
 */
export const securityHeaders = (req, res, next) => {
  // Prevenir que el navegador haga MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protección XSS para navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Evitar que la página sea enmarcada (clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Política de referencia
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Política de características
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'");
  
  next();
};

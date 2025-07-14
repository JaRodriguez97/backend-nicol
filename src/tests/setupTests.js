import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno para testing
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.test') 
});

// Configuración global para tests
global.console = {
  ...console,
  // Silenciar logs durante los tests (opcional)
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

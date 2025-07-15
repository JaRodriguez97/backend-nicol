import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno para testing
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.test') 
});

// 🔒 VALIDACIONES DE SEGURIDAD ANTES DE EJECUTAR TESTS
const validateTestEnvironment = () => {
  // Verificar que NODE_ENV está configurado como 'test'
  if (process.env.NODE_ENV !== 'test') {
    console.error('❌ ERROR: NODE_ENV debe ser "test" para ejecutar tests');
    console.error('Actual:', process.env.NODE_ENV);
    process.exit(1);
  }
  
  // Verificar que existe MONGO_URI_TEST
  if (!process.env.MONGO_URI_TEST) {
    console.error('❌ ERROR: MONGO_URI_TEST no está definida en .env.test');
    process.exit(1);
  }
  
  // Verificar que la URI de test es diferente a la de producción
  if (process.env.MONGO_URI_TEST === process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI_TEST no puede ser igual a MONGO_URI');
    process.exit(1);
  }
  
  // Verificar que la URI de test contiene 'test' o 'local'
  const testUri = process.env.MONGO_URI_TEST.toLowerCase();
  if (!testUri.includes('test') && !testUri.includes('local')) {
    console.error('❌ ERROR: MONGO_URI_TEST debe contener "test" o "local"');
    process.exit(1);
  }
  
  console.log('✅ Validaciones de seguridad de testing aprobadas');
  console.log('🧪 Ambiente de testing configurado correctamente');
};

// Ejecutar validaciones
validateTestEnvironment();

// Configuración global para tests
global.console = {
  ...console,
  // Mantener algunos logs importantes durante los tests
  log: console.log,
  debug: () => {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Configuración adicional para Jest
// jest.setTimeout se configura en jest.config.cjs con testTimeout

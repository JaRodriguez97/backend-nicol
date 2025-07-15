import dotenv from 'dotenv';
import path from 'path';

// Cargar configuración específica para testing
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.test') 
});

// Validaciones de seguridad para evitar conectar a producción
const validateTestEnvironment = () => {
  // Verificar que estamos en ambiente de testing
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('❌ Los tests solo pueden ejecutarse con NODE_ENV=test');
  }

  // Verificar que existe la URI de testing
  if (!process.env.MONGO_URI_TEST) {
    throw new Error('❌ MONGO_URI_TEST no está definida en .env.test');
  }

  // Verificar que la URI de testing no es la misma que producción
  if (process.env.MONGO_URI_TEST === process.env.MONGO_URI) {
    throw new Error('❌ MONGO_URI_TEST no puede ser igual a MONGO_URI (producción)');
  }

  // Verificar que la URI de testing contiene 'test' o 'local'
  const testUri = process.env.MONGO_URI_TEST.toLowerCase();
  if (!testUri.includes('test') && !testUri.includes('local')) {
    throw new Error('❌ MONGO_URI_TEST debe contener "test" o "local" en el nombre');
  }

  console.log('✅ Validaciones de seguridad de testing aprobadas');
};

// Configuración específica para testing
export const testConfig = {
  mongoUri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nicol_nails_test',
  jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
  port: process.env.PORT || 5001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  
  // Validar ambiente antes de devolver configuración
  validate: validateTestEnvironment
};

export default testConfig;

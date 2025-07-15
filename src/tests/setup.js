import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Usuario from '../models/Usuario.js';
import Servicio from '../models/Servicio.js';
import Cita from '../models/Cita.js';
import jwt from 'jsonwebtoken';

// Variable global para el servidor de MongoDB en memoria
let mongoServer = null;

// Datos de prueba
export const testData = {
  admin: {
    celular: 3001234567,
    nombre: 'Admin Test',
    password: 'password123',
    rol: 'admin'
  },
  cliente: {
    celular: 3009876543,
    nombre: 'Cliente Test',
    password: 'password123',
    rol: 'cliente'
  },
  servicio: {
    categoria: 'Tradicional',
    nombre: 'Manos',
    precio: 25000,
    duracion: 60
  },
  cita: {
    celular: 3009876543,
    fecha: '2025-12-31',
    hora: '10:00 AM',
    estado: 'Pendiente'
  }
};

// Setup de base de datos para tests usando MongoDB en memoria
export const setupTestDB = async () => {
  try {
    // 🔒 VALIDACIÓN DE SEGURIDAD: Solo en ambiente de testing
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('❌ Tests solo pueden ejecutarse con NODE_ENV=test');
    }
    
    console.log('🧪 Iniciando MongoDB en memoria para testing...');
    
    // Crear servidor de MongoDB en memoria
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'nicol_nails_test_memory'
        }
      });
    }
    
    const mongoUri = mongoServer.getUri();
    console.log('✅ MongoDB en memoria iniciado');
    
    // Cerrar conexión previa si existe
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Conectar a la base de datos en memoria
    await mongoose.connect(mongoUri);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Conectado a BD en memoria:', dbName);
    
    // Limpiar todas las colecciones (siempre necesario en memoria)
    console.log('🧹 Limpiando colecciones...');
    await Usuario.deleteMany({});
    await Servicio.deleteMany({});
    await Cita.deleteMany({});
    
    // Crear datos de prueba
    console.log('📝 Creando datos de prueba...');
    const admin = new Usuario(testData.admin);
    await admin.save();
    
    const cliente = new Usuario(testData.cliente);
    await cliente.save();
    
    const servicio = new Servicio(testData.servicio);
    await servicio.save();
    
    console.log('✅ Setup de BD en memoria completado');
    return { admin, cliente, servicio };
    
  } catch (error) {
    console.error('❌ Error en setup de BD en memoria:', error.message);
    process.exit(1);
  }
};

// Cleanup de base de datos en memoria con validaciones de seguridad
export const cleanupTestDB = async () => {
  try {
    // Verificar que estamos en ambiente de testing
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('❌ Cleanup solo permitido en ambiente de testing');
    }
    
    console.log('🧹 Limpiando BD en memoria...');
    
    // Limpiar colecciones
    if (mongoose.connection.readyState === 1) {
      await Usuario.deleteMany({});
      await Servicio.deleteMany({});
      await Cita.deleteMany({});
      await mongoose.connection.close();
    }
    
    // Detener servidor de MongoDB en memoria
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    
    console.log('✅ Cleanup completado');
    
  } catch (error) {
    console.error('❌ Error en cleanup:', error.message);
    throw error;
  }
};

// Generar tokens para pruebas
export const generateTokens = (admin, cliente) => {
  const adminToken = jwt.sign(
    { id: admin._id, rol: admin.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const clienteToken = jwt.sign(
    { id: cliente._id, rol: cliente.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return { adminToken, clienteToken };
};

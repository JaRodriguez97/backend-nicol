import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Servicio from '../models/Servicio.js';
import Cita from '../models/Cita.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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

// Setup de base de datos para tests
export const setupTestDB = async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nicol_nails_test';
  
  // Cerrar conexión previa si existe
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Conectar a la base de datos
  await mongoose.connect(url);
  
  // Limpiar todas las colecciones
  await Usuario.deleteMany({});
  await Servicio.deleteMany({});
  await Cita.deleteMany({});
  
  // Crear datos de prueba
  const admin = new Usuario(testData.admin);
  await admin.save();
  
  const cliente = new Usuario(testData.cliente);
  await cliente.save();
  
  const servicio = new Servicio(testData.servicio);
  await servicio.save();
  
  return { admin, cliente, servicio };
};

// Cleanup de base de datos
export const cleanupTestDB = async () => {
  await Usuario.deleteMany({});
  await Servicio.deleteMany({});
  await Cita.deleteMany({});
  await mongoose.connection.close();
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

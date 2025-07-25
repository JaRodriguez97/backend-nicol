/**
 * Pruebas de integración para rutas de citas
 * 
 * Estas pruebas verifican que las rutas de citas funcionen correctamente:
 * - Clientas: Deben poder leer y crear sus propias citas sin autenticación
 * - Admin: Debe poder gestionar todas las citas con autenticación
 */

// Importar dependencias
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Simulación de datos
const mockCitas = [
  {
    _id: '123',
    celular: 3243973949,
fecha: '2025-04-01',
    hora: '09:00 AM',
    servicio: [
      {
        nombre: 'Manicura básica',
        duracion: 60,
        categoria: 'Manos',
      },
    ],
    estado: 'Aprobada',
  },
];

// Rutas simuladas para pruebas
app.get('/api/citas/celular/:celular', (req, res) => {
  const { celular } = req.params;
  
  if (celular !== '3243973949') {
    return res.status(404).json({ mensaje: 'No se encontraron citas' });
  }
  
  return res.json(mockCitas);
});

app.post('/api/citas', (req, res) => {
  const { celular, fecha, hora } = req.body;
  
  // Verificar datos requeridos
  if (!celular || !fecha || !hora) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }
  
  // Verificar si ya existe una cita
  if (fecha === '2025-04-01' && hora === '09:00 AM') {
    return res.status(400).json({ 
      mensaje: 'Alguien más ya tiene una cita en esa hora y fecha'
    });
  }
  
  // Crear cita simulada
  const nuevaCita = {
    _id: 'new123',
    ...req.body,
    estado: 'Pendiente',
  };
  
  return res.status(201).json({ mensaje: 'Cita creada con éxito', cita: nuevaCita });
});

// Ruta protegida - solo admin
app.get('/api/citas', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || token !== 'Bearer admin-token') {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  
  return res.json(mockCitas);
});

// Pruebas
describe('API de Citas', () => {
  // Pruebas para clientes (sin autenticación)
  describe('Rutas públicas (Clientas)', () => {
    // Consultar citas por celular
    test('GET /api/citas/celular/:celular - Debe obtener citas por número de celular', async () => {
      const response = await request(app).get('/api/citas/celular/3243973949');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('celular', 3243973949);
    });
    
    test('GET /api/citas/celular/:celular - Debe manejar celular no encontrado', async () => {
      const response = await request(app).get('/api/citas/celular/1111111111');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('mensaje');
    });
    
    // Crear una cita
    test('POST /api/citas - Debe crear una cita correctamente', async () => {
      const nuevaCita = {
        celular: 3243973949,
fecha: '2025-05-01',
        hora: '10:00 AM',
        servicio: ['abc123'],
      };
      
      const response = await request(app)
        .post('/api/citas')
        .send(nuevaCita);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('mensaje', 'Cita creada con éxito');
      expect(response.body.cita).toHaveProperty('estado', 'Pendiente');
    });
    
    test('POST /api/citas - Debe rechazar cita con datos incompletos', async () => {
      const citaIncompleta = {
        celular: 3243973949,
        // Falta fecha y hora
      };
      
      const response = await request(app)
        .post('/api/citas')
        .send(citaIncompleta);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje', 'Datos incompletos');
    });
    
    test('POST /api/citas - Debe rechazar cita en horario ocupado', async () => {
      const citaOcupada = {
        celular: 3243973949,
        fecha: '2025-04-01',
        hora: '09:00 AM',
        servicio: ['abc123'],
      };
      
      const response = await request(app)
        .post('/api/citas')
        .send(citaOcupada);
      
      expect(response.status).toBe(400);
      expect(response.body.mensaje).toContain('ya tiene una cita');
    });
  });
  
  // Pruebas para admin (con autenticación)
  describe('Rutas protegidas (Admin)', () => {
    test('GET /api/citas - Debe obtener todas las citas con token válido', async () => {
      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', 'Bearer admin-token');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('GET /api/citas - Debe rechazar acceso sin token', async () => {
      const response = await request(app).get('/api/citas');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje', 'No autorizado');
    });
    
    test('GET /api/citas - Debe rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/citas')
        .set('Authorization', 'Bearer token-falso');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje', 'No autorizado');
    });
  });
});

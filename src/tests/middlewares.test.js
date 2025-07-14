import request from 'supertest';
import app from '../app.js';
import { setupTestDB, cleanupTestDB, generateTokens } from './setup.js';

describe('Middlewares de validación y seguridad', () => {
  let adminToken;
  let clienteToken;
  let servicio;

  beforeAll(async () => {
    const { admin, cliente, servicio: testServicio } = await setupTestDB();
    const { adminToken: aToken, clienteToken: cToken } = generateTokens(admin, cliente);
    adminToken = aToken;
    clienteToken = cToken;
    servicio = testServicio;
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  describe('Validación de datos de cita', () => {
    // Test para celular inválido
    test('Validación de celular inválido', async () => {
      const citaInvalida = {
        celular: 123456789, // No comienza con 3
        fecha: '2025-12-31',
        hora: '10:00 AM',
        servicio: [servicio._id]
      };

      const res = await request(app)
        .post('/api/citas')
        .send(citaInvalida);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('El número de celular debe comenzar por 3 y tener 10 dígitos');
    });

    // Test para fecha inválida
    test('Validación de fecha inválida', async () => {
      const citaInvalida = {
        celular: 3009876543,
        fecha: '2020-12-31', // Fecha anterior a hoy
        hora: '10:00 AM',
        servicio: [servicio._id]
      };

      const res = await request(app)
        .post('/api/citas')
        .send(citaInvalida);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('La fecha de la cita no puede ser anterior a hoy');
    });

    // Test para hora inválida
    test('Validación de hora inválida', async () => {
      const citaInvalida = {
        celular: 3009876543,
        fecha: '2025-12-31',
        hora: '25:00', // Hora inválida
        servicio: [servicio._id]
      };

      const res = await request(app)
        .post('/api/citas')
        .send(citaInvalida);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('La hora debe tener el formato HH:MM AM/PM (ejemplo: 10:00 AM, 02:30 PM)');
    });

    // Test para servicio faltante
    test('Validación de servicio faltante', async () => {
      const citaInvalida = {
        celular: 3009876543,
        fecha: '2025-12-31',
        hora: '10:00 AM'
        // Sin servicio
      };

      const res = await request(app)
        .post('/api/citas')
        .send(citaInvalida);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('Debe seleccionar al menos un servicio');
    });
  });

  describe('Validación de login', () => {
    // Test para celular inválido en login
    test('Login con celular inválido', async () => {
      const datosLogin = {
        celular: 123,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/usuarios/login')
        .send(datosLogin);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('El número de celular debe comenzar por 3 y tener 10 dígitos');
    });

    // Test para contraseña muy corta
    test('Login con contraseña muy corta', async () => {
      const datosLogin = {
        celular: 3009876543,
        password: '123'
      };

      const res = await request(app)
        .post('/api/usuarios/login')
        .send(datosLogin);

      expect(res.statusCode).toBe(400);
      expect(res.body.errores).toContain('La contraseña debe tener al menos 6 caracteres');
    });
  });

  describe('Middleware de autenticación', () => {
    // Test para token inválido
    test('Token inválido', async () => {
      const res = await request(app)
        .get('/api/usuarios/me')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.statusCode).toBe(401);
      expect(res.body.mensaje).toContain('Token inválido');
    });

    // Test para token faltante
    test('Token faltante', async () => {
      const res = await request(app)
        .get('/api/usuarios/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.mensaje).toContain('Se requiere token de autenticación');
    });

    // Test para token en formato incorrecto
    test('Token en formato incorrecto', async () => {
      const res = await request(app)
        .get('/api/usuarios/me')
        .set('Authorization', 'InvalidFormat token');

      expect(res.statusCode).toBe(401);
      expect(res.body.mensaje).toContain('Token inválido');
    });
  });

  describe('Middleware de autorización (admin)', () => {
    // Test para acceso no autorizado a rutas de admin
    test('Acceso no autorizado a rutas de admin', async () => {
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.mensaje).toContain('Se requieren permisos de administrador');
    });

    // Test para acceso autorizado a rutas de admin
    test('Acceso autorizado a rutas de admin', async () => {
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Validación de ID de cita', () => {
    // Test para ID inválido
    test('ID de cita inválido', async () => {
      const res = await request(app)
        .put('/api/citas/invalid_id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado: 'Aprobada',
          celular: 3009876543
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.mensaje).toBe('ID de cita inválido');
    });

    // Test para ID de formato correcto pero inexistente
    test('ID de cita inexistente', async () => {
      const res = await request(app)
        .put('/api/citas/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado: 'Aprobada',
          celular: 3009876543
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.mensaje).toBe('Cita no encontrada');
    });
  });

  describe('Validación de estado de cita', () => {
    // Test para estado inválido
    test('Estado de cita inválido', async () => {
      // Primero crear una cita
      const nuevaCita = {
        celular: 3009876543,
        fecha: '2025-12-30',
        hora: '2:00 PM',
        servicio: [servicio._id],
        estado: 'Pendiente'
      };

      const createRes = await request(app)
        .post('/api/citas')
        .send(nuevaCita);

      const citaId = createRes.body.cita._id;

      // Intentar actualizar con estado inválido
      const res = await request(app)
        .put(`/api/citas/${citaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado: 'Estado Inválido',
          celular: 3009876543
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.mensaje).toBe('Estado de cita inválido');
      expect(res.body.estadosValidos).toContain('Pendiente');
    });

    // Test para estado faltante
    test('Estado de cita faltante', async () => {
      // Crear una cita
      const nuevaCita = {
        celular: 3009876543,
        fecha: '2025-12-29',
        hora: '3:00 PM',
        servicio: [servicio._id],
        estado: 'Pendiente'
      };

      const createRes = await request(app)
        .post('/api/citas')
        .send(nuevaCita);

      const citaId = createRes.body.cita._id;

      // Intentar actualizar sin estado
      const res = await request(app)
        .put(`/api/citas/${citaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          celular: 3009876543
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.mensaje).toBe('El estado de la cita es obligatorio');
    });
  });

  describe('Cabeceras de seguridad', () => {
    // Test para verificar que las cabeceras de seguridad estén presentes
    test('Cabeceras de seguridad presentes', async () => {
      const res = await request(app)
        .get('/api/servicios');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['referrer-policy']).toBe('same-origin');
    });
  });
});

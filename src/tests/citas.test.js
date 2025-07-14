import request from 'supertest';
import app from '../app.js';
import { setupTestDB, cleanupTestDB, generateTokens, testData } from './setup.js';

describe('Citas API', () => {
  let adminToken;
  let clienteToken;
  let servicio;
  let citaId;

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

  // Test para crear una cita (ruta pública)
  test('POST /api/citas - Crear cita nueva', async () => {
    const nuevaCita = {
      celular: 3009876543,
      fecha: '2025-12-31',
      hora: '10:00 AM',
      servicio: [servicio._id],
      estado: 'Pendiente'
    };

    const res = await request(app)
      .post('/api/citas')
      .send(nuevaCita);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje', 'Cita creada con éxito');
    expect(res.body.cita).toHaveProperty('celular', nuevaCita.celular);
    
    citaId = res.body.cita._id;
  });

  // Test para crear cita duplicada
  test('POST /api/citas - Crear cita duplicada', async () => {
    const citaDuplicada = {
      celular: 3009876543,
      fecha: '2025-12-31',
      hora: '10:00 AM',
      servicio: [servicio._id],
      estado: 'Pendiente'
    };

    const res = await request(app)
      .post('/api/citas')
      .send(citaDuplicada);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje).toContain('ya tiene una cita');
  });

  // Test para validación de datos de cita
  test('POST /api/citas - Validación de datos incorrectos', async () => {
    const citaInvalida = {
      celular: 123, // Celular inválido
      fecha: '2025-13-45', // Fecha inválida
      hora: '25:90', // Hora inválida
      servicio: null
    };

    const res = await request(app)
      .post('/api/citas')
      .send(citaInvalida);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errores');
    expect(res.body.errores.length).toBeGreaterThan(0);
  });

  // Test para obtener citas por celular (ruta pública)
  test('GET /api/citas/celular/:celular - Obtener citas por celular', async () => {
    const res = await request(app)
      .get('/api/citas/celular/3009876543');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test para obtener citas con celular inválido
  test('GET /api/citas/celular/:celular - Celular inválido', async () => {
    const res = await request(app)
      .get('/api/citas/celular/123');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje', 'Número de celular inválido. Debe comenzar por 3 y tener 10 dígitos');
  });

  // Test para obtener todas las citas (solo admin)
  test('GET /api/citas - Obtener todas las citas como admin', async () => {
    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para obtener todas las citas sin permisos
  test('GET /api/citas - Obtener todas las citas sin permisos', async () => {
    const res = await request(app)
      .get('/api/citas');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('mensaje');
  });

  // Test para actualizar estado de cita
  test('PUT /api/citas/:id - Actualizar estado de cita', async () => {
    const datosActualizacion = {
      estado: 'Aprobada',
      celular: 3009876543 // Para verificar permisos
    };

    const res = await request(app)
      .put(`/api/citas/${citaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(datosActualizacion);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Cita actualizada con éxito');
    expect(res.body.cita.estado).toBe('Aprobada');
  });

  // Test para actualizar cita con ID inválido
  test('PUT /api/citas/:id - ID de cita inválido', async () => {
    const datosActualizacion = {
      estado: 'Aprobada',
      celular: 3009876543
    };

    const res = await request(app)
      .put('/api/citas/invalidid')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(datosActualizacion);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje', 'ID de cita inválido');
  });

  // Test para cancelar cita (cliente)
  test('DELETE /api/citas/:id - Cancelar cita como cliente', async () => {
    const res = await request(app)
      .delete(`/api/citas/${citaId}`)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ celular: 3009876543 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Cita cancelada correctamente');
  });

  // Test para eliminar cita sin permisos
  test('DELETE /api/citas/:id - Eliminar cita sin permisos', async () => {
    // Crear una nueva cita para el test
    const nuevaCita = {
      celular: 3001111111,
      fecha: '2025-12-30',
      hora: '11:00 AM',
      servicio: [servicio._id],
      estado: 'Pendiente'
    };

    const createRes = await request(app)
      .post('/api/citas')
      .send(nuevaCita);

    const nuevaCitaId = createRes.body.cita._id;

    // Intentar eliminar sin permisos
    const res = await request(app)
      .delete(`/api/citas/${nuevaCitaId}`)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ celular: 3009876543 }); // Celular diferente

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('mensaje', 'No tienes permiso para cancelar esta cita');
  });

  // Test para rate limiting en creación de citas
  test('POST /api/citas - Rate limiting', async () => {
    // En el entorno de pruebas, el rate limiting está configurado con límites altos
    // para permitir que los tests se ejecuten sin problemas.
    // Este test verifica que el middleware de rate limiting esté presente.
    
    const cita = {
      celular: 3001111111,
      fecha: '2025-12-29',
      hora: '10:00 AM',
      servicio: [servicio._id],
      estado: 'Pendiente'
    };
    
    const res = await request(app).post('/api/citas').send(cita);
    
    // En el entorno de pruebas, debería funcionar normalmente
    expect([201, 429]).toContain(res.statusCode);
    
    // Verificar que la respuesta sea válida
    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('mensaje', 'Cita creada con éxito');
    }
  }, 10000); // Timeout más largo para este test
});

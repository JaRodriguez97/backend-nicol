import request from 'supertest';
import app from '../app.js';
import { setupTestDB, cleanupTestDB, generateTokens } from './setup.js';

describe('Servicios API', () => {
  let adminToken;
  let servicio;

  beforeAll(async () => {
    const { admin, cliente, servicio: testServicio } = await setupTestDB();
    const { adminToken: token } = generateTokens(admin, cliente);
    adminToken = token;
    servicio = testServicio;
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  // Test para obtener todos los servicios
  test('GET /api/servicios - Obtener todos los servicios', async () => {
    const res = await request(app)
      .get('/api/servicios');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('Tradicional');
    expect(Array.isArray(res.body.Tradicional)).toBe(true);
  });

  // Test para obtener un servicio específico
  test('GET /api/servicios/:id - Obtener servicio específico', async () => {
    const res = await request(app)
      .get(`/api/servicios/${servicio._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre', 'Manos');
    expect(res.body).toHaveProperty('categoria', 'Tradicional');
  });

  // Test para servicio no encontrado
  test('GET /api/servicios/:id - Servicio no encontrado', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/servicios/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('mensaje', 'Servicio no encontrado');
  });

  // Test para crear un servicio (solo admin)
  test('POST /api/servicios - Crear servicio con permisos de admin', async () => {
    const nuevoServicio = {
      categoria: 'Acrilico',
      nombre: 'Esculpidas largo #1 y #2',
      precio: 40000,
      duracion: 90
    };

    const res = await request(app)
      .post('/api/servicios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(nuevoServicio);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje', 'Servicio creado con éxito');
    expect(res.body.servicio).toHaveProperty('nombre', nuevoServicio.nombre);
  });

  // Test para crear servicio sin autenticación
  test('POST /api/servicios - Crear servicio sin autenticación', async () => {
    const nuevoServicio = {
      categoria: 'Acrilico',
      nombre: 'Retoque de acrílico',
      precio: 30000,
      duracion: 60
    };

    const res = await request(app)
      .post('/api/servicios')
      .send(nuevoServicio);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('mensaje');
  });

  // Test para actualizar servicio
  test('PUT /api/servicios/:id - Actualizar servicio', async () => {
    const datosActualizados = {
      categoria: 'Tradicional',
      nombre: 'Manos',
      precio: 30000,
      duracion: 70
    };

    const res = await request(app)
      .put(`/api/servicios/${servicio._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(datosActualizados);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Servicio actualizado con éxito');
    expect(res.body.servicio.precio).toBe(30000);
  });

  // Test para eliminar servicio
  test('DELETE /api/servicios/:id - Eliminar servicio', async () => {
    const res = await request(app)
      .delete(`/api/servicios/${servicio._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Servicio eliminado con éxito');
  });
});

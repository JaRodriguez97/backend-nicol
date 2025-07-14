import request from 'supertest';
import app from '../app.js';
import { setupTestDB, cleanupTestDB, generateTokens, testData } from './setup.js';

describe('Autenticación y seguridad', () => {
  let adminToken;
  
  // Antes de todas las pruebas
  beforeAll(async () => {
    const { admin, cliente } = await setupTestDB();
    const { adminToken: token } = generateTokens(admin, cliente);
    adminToken = token;
  });
  
  // Después de todas las pruebas
  afterAll(async () => {
    await cleanupTestDB();
  });
  
  // Test de login exitoso
  test('Login exitoso con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        celular: testData.admin.celular,
        password: testData.admin.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('rol', 'admin');
  });
  
  // Test de login fallido - celular incorrecto
  test('Login fallido con celular incorrecto', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        celular: 3009999999, // Celular que no existe
        password: testData.admin.password
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
  });
  
  // Test de login fallido - contraseña incorrecta
  test('Login fallido con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        celular: testData.admin.celular,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
  });
  
  // Test de login fallido - validación de datos
  test('Login fallido por validación de datos', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        celular: 123, // Celular inválido
        password: 'pass' // Contraseña demasiado corta
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errores');
    expect(res.body.errores.length).toBeGreaterThan(0);
  });
  
  // Test de acceso a ruta protegida con token válido
  test('Acceso a ruta protegida con token válido', async () => {
    const res = await request(app)
      .get('/api/usuarios/me')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('rol', 'admin');
  });
  
  // Test de acceso a ruta protegida sin token
  test('Acceso denegado a ruta protegida sin token', async () => {
    const res = await request(app)
      .get('/api/usuarios/me');
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('mensaje');
  });
  
  // Test de acceso a ruta de admin con rol correcto
  test('Acceso a ruta de admin con rol correcto', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  // Test de token en formato incorrecto
  test('Rechazo de token en formato incorrecto', async () => {
    const res = await request(app)
      .get('/api/usuarios/me')
      .set('Authorization', 'Bearer token_completamente_invalido');
    
    expect(res.statusCode).toBe(401);
  });
});

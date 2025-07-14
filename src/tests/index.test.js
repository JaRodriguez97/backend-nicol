import './auth.test.js';
import './servicios.test.js';
import './citas.test.js';
import './middlewares.test.js';

// Este archivo asegura que todos los tests se ejecuten
// Jest automáticamente detectará y ejecutará todos los archivos .test.js

describe('Suite completa de tests', () => {
  test('Todos los tests han sido cargados', () => {
    // Este test simplemente confirma que la suite se ha cargado correctamente
    expect(true).toBe(true);
  });
});

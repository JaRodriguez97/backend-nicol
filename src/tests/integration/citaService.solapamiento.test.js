// Mock del modelo Cita primero
jest.mock('../../models/Cita.js', () => ({
  find: jest.fn()
}));

// Importación después del mock
const { verificarCitaExistente } = require('../../services/citaService.js');
const Cita = require('../../models/Cita.js');

describe('Pruebas de solapamiento de citas', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe permitir crear una cita que comienza exactamente cuando termina otra', async () => {
    // Mock de citas existentes
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '11:00 AM',
        duracionTotal: 30, // 11:00 AM - 11:30 AM
        celular: 3001234567,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita que comience exactamente cuando termina la anterior
    const resultado = await verificarCitaExistente('2025-01-15', '11:30 AM', 30);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toBeNull(); // No debe haber conflicto
  });

  test('debe detectar solapamiento cuando una cita se superpone parcialmente', async () => {
    // Mock de citas existentes
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '11:00 AM',
        duracionTotal: 60, // 11:00 AM - 12:00 PM
        celular: 3001234567,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita que se superpone (11:30 AM - 12:30 PM)
    const resultado = await verificarCitaExistente('2025-01-15', '11:30 AM', 60);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toEqual(citasExistentes[0]); // Debe detectar el conflicto
  });

  test('debe permitir citas que no se superponen en absoluto', async () => {
    // Mock de citas existentes
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '11:00 AM',
        duracionTotal: 30, // 11:00 AM - 11:30 AM
        celular: 3001234567,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita completamente separada (2:00 PM - 3:00 PM)
    const resultado = await verificarCitaExistente('2025-01-15', '2:00 PM', 60);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toBeNull(); // No debe haber conflicto
  });

  test('debe permitir múltiples citas consecutivas sin solapamiento', async () => {
    // Mock de citas existentes con múltiples citas consecutivas
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '10:00 AM',
        duracionTotal: 30, // 10:00 AM - 10:30 AM
        celular: 3001234567,
        estado: 'Aprobada'
      },
      {
        _id: '456',
        fecha: '2025-01-15',
        hora: '10:30 AM',
        duracionTotal: 30, // 10:30 AM - 11:00 AM
        celular: 3001234568,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita que comience exactamente cuando termina la segunda (11:00 AM - 11:30 AM)
    const resultado = await verificarCitaExistente('2025-01-15', '11:00 AM', 30);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toBeNull(); // No debe haber conflicto
  });

  test('debe detectar solapamiento con formato de hora 12:00 PM', async () => {
    // Mock de citas existentes
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '12:00 PM',
        duracionTotal: 60, // 12:00 PM - 1:00 PM
        celular: 3001234567,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita que se superpone (12:30 PM - 1:30 PM)
    const resultado = await verificarCitaExistente('2025-01-15', '12:30 PM', 60);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toEqual(citasExistentes[0]); // Debe detectar el conflicto
  });

  test('debe permitir cita que comience cuando termina una cita a las 12:00 PM', async () => {
    // Mock de citas existentes
    const citasExistentes = [
      {
        _id: '123',
        fecha: '2025-01-15',
        hora: '12:00 PM',
        duracionTotal: 30, // 12:00 PM - 12:30 PM
        celular: 3001234567,
        estado: 'Aprobada'
      }
    ];

    Cita.find.mockResolvedValue(citasExistentes);

    // Intentar crear una cita que comience exactamente cuando termina (12:30 PM - 1:00 PM)
    const resultado = await verificarCitaExistente('2025-01-15', '12:30 PM', 30);

    expect(Cita.find).toHaveBeenCalledWith({ fecha: '2025-01-15' });
    expect(resultado).toBeNull(); // No debe haber conflicto
  });
});

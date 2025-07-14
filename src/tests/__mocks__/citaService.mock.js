// Mock de las funciones del servicio de citas
module.exports = {
  verificarCitaExistente: jest.fn(),
  crearNuevaCita: jest.fn(),
  obtenerCitasUsuario: jest.fn(),
  obtenerTodasCitas: jest.fn(),
  obtenerCitasPorCelularService: jest.fn(),
  actualizarEstadoCita: jest.fn(),
  eliminarCitaService: jest.fn(),
  verificarPermisosCita: jest.fn()
};

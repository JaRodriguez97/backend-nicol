const mongoose = require('mongoose');
const citaService = require('../__mocks__/citaService.mock.js');

// Mock del modelo Cita
const Cita = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  aggregate: jest.fn(),
  deleteOne: jest.fn()
};

// Mock de mongoose
mongoose.connect = jest.fn();

describe('Servicio de Citas', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarCitaExistente', () => {
    it('debe verificar si existe una cita en la fecha y hora dada', async () => {
      const mockCita = { _id: '123', fecha: '05/01/2025', hora: '10:00 AM' };
      Cita.findOne.mockResolvedValue(mockCita);

      const result = await citaService.verificarCitaExistente('05/01/2025', '10:00 AM');
      
      expect(Cita.findOne).toHaveBeenCalledWith({ fecha: '05/01/2025', hora: '10:00 AM' });
      expect(result).toEqual(mockCita);
    });
  });

  describe('crearNuevaCita', () => {
    it('debe crear una nueva cita correctamente', async () => {
      const citaData = {
        celular: 3243973949,
        fecha: '05/01/2025',
        hora: '10:00 AM',
        servicio: ['abc123'],
        estado: 'Pendiente',
        historial: [{ estado: 'Pendiente' }]
      };

      const mockCita = {
        ...citaData,
        _id: 'nuevoid123',
        save: jest.fn().mockResolvedValue({ ...citaData, _id: 'nuevoid123' })
      };

      jest.spyOn(global, 'Cita').mockImplementation(() => mockCita);

      const result = await citaService.crearNuevaCita(citaData);
      
      expect(mockCita.save).toHaveBeenCalled();
      expect(result).toEqual({ ...citaData, _id: 'nuevoid123' });
    });
  });

  describe('obtenerCitasUsuario', () => {
    it('debe obtener todas las citas de un usuario', async () => {
      const mockCitas = [
        { _id: '123', usuario: 'user1', fecha: '05/01/2025' },
        { _id: '456', usuario: 'user1', fecha: '06/01/2025' }
      ];
      
      Cita.find.mockResolvedValue(mockCitas);
      
      const result = await citaService.obtenerCitasUsuario('user1');
      
      expect(Cita.find).toHaveBeenCalledWith({ usuario: 'user1' });
      expect(result).toEqual(mockCitas);
    });
  });

  describe('obtenerTodasCitas', () => {
    it('debe obtener todas las citas con el formato correcto', async () => {
      const mockCitas = [
        { _id: '123', celular: 3243973949, estado: 'Aprobada' },
        { _id: '456', celular: 3243973949, estado: 'Completada' }
      ];
      
      Cita.aggregate.mockResolvedValue(mockCitas);
      
      const result = await citaService.obtenerTodasCitas();
      
      expect(Cita.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockCitas);
    });
  });

  describe('obtenerCitasPorCelularService', () => {
    it('debe obtener citas por número de celular', async () => {
      const mockCitas = [
        { _id: '123', celular: 3243973949, fecha: '05/01/2025' },
        { _id: '456', celular: 3243973949, fecha: '06/01/2025' }
      ];
      
      Cita.aggregate.mockResolvedValue(mockCitas);
      
      const result = await citaService.obtenerCitasPorCelularService(3243973949);
      
      expect(Cita.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockCitas);
    });
  });

  describe('actualizarEstadoCita', () => {
    it('debe actualizar el estado de una cita', async () => {
      const mockCita = {
        _id: '123',
        estado: 'Aprobada',
        historial: [{ estado: 'Pendiente', fecha: new Date() }]
      };
      
      Cita.findByIdAndUpdate.mockResolvedValue(mockCita);
      
      const result = await citaService.actualizarEstadoCita('123', 'Aprobada');
      
      expect(Cita.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        {
          estado: 'Aprobada',
          $push: { historial: { estado: 'Aprobada', fecha: expect.any(Date) } }
        },
        { new: true }
      );
      expect(result).toEqual(mockCita);
    });
  });

  describe('eliminarCitaService', () => {
    it('debe eliminar una cita correctamente', async () => {
      const mockCita = {
        _id: '123',
        deleteOne: jest.fn().mockResolvedValue({ acknowledged: true })
      };
      
      Cita.findById.mockResolvedValue(mockCita);
      
      const result = await citaService.eliminarCitaService('123');
      
      expect(Cita.findById).toHaveBeenCalledWith('123');
      expect(mockCita.deleteOne).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('debe retornar false si la cita no existe', async () => {
      Cita.findById.mockResolvedValue(null);
      
      const result = await citaService.eliminarCitaService('nonexistent');
      
      expect(Cita.findById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('verificarPermisosCita', () => {
    it('debe permitir acceso a un admin', async () => {
      const mockCita = {
        _id: '123',
        usuario: 'user1'
      };
      
      Cita.findById.mockResolvedValue(mockCita);
      
      const result = await citaService.verificarPermisosCita('123', 'adminId', 'admin');
      
      expect(Cita.findById).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    it('debe permitir acceso al dueño de la cita', async () => {
      const mockCita = {
        _id: '123',
        usuario: 'user1',
        toString: jest.fn().mockReturnValue('user1')
      };
      
      Cita.findById.mockResolvedValue({ ...mockCita, usuario: { toString: () => 'user1' } });
      
      const result = await citaService.verificarPermisosCita('123', 'user1', 'usuario');
      
      expect(Cita.findById).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    it('debe denegar acceso a un usuario que no es dueño', async () => {
      const mockCita = {
        _id: '123',
        usuario: 'user1',
        toString: jest.fn().mockReturnValue('user1')
      };
      
      Cita.findById.mockResolvedValue({ ...mockCita, usuario: { toString: () => 'user1' } });
      
      const result = await citaService.verificarPermisosCita('123', 'user2', 'usuario');
      
      expect(Cita.findById).toHaveBeenCalledWith('123');
      expect(result).toBe(false);
    });
  });
});

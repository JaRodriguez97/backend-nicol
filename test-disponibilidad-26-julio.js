import { generarHorariosPosibles, convertirHoraAMinutos } from './src/utils/timeUtils.js';

console.log('=== PRUEBA DE DISPONIBILIDAD 26 JULIO ===');

// Simular las citas existentes del 26 de julio
const citasExistentes = [
  { hora: "11:00 AM", duracionTotal: 30 },
  { hora: "11:30 AM", duracionTotal: 30 }
];

console.log('Citas existentes:');
citasExistentes.forEach((cita, index) => {
  console.log(`${index + 1}. ${cita.hora} (duración: ${cita.duracionTotal} min)`);
});

// Generar todos los horarios posibles
const horariosPosibles = generarHorariosPosibles();
console.log(`\nTotal de horarios posibles: ${horariosPosibles.length}`);

// Simular duracion de servicio (asumiendo 60 min por defecto)
const duracionServicio = 60;

// Filtrar horarios disponibles usando la misma lógica del controlador
const horariosDisponibles = horariosPosibles.filter(horario => {
  const inicioHorario = convertirHoraAMinutos(horario);
  const finHorario = inicioHorario + duracionServicio;
  
  console.log(`\n--- Evaluando ${horario} ---`);
  console.log(`Inicio: ${inicioHorario} minutos, Fin: ${finHorario} minutos`);
  
  // Verificar si este horario se solapa con alguna cita existente
  const haySolapamiento = citasExistentes.some(cita => {
    const inicioCita = convertirHoraAMinutos(cita.hora);
    const finCita = inicioCita + cita.duracionTotal;
    
    console.log(`  Comparando con cita ${cita.hora}: inicio ${inicioCita}, fin ${finCita}`);
    
    // Se considera solapamiento si hay intersección entre los rangos de tiempo
    const solapamiento = (inicioHorario < finCita && finHorario > inicioCita);
    console.log(`  ¿Hay solapamiento? ${solapamiento}`);
    
    return solapamiento;
  });
  
  console.log(`Resultado para ${horario}: ${haySolapamiento ? 'NO DISPONIBLE' : 'DISPONIBLE'}`);
  
  return !haySolapamiento;
});

console.log('\n=== HORARIOS DISPONIBLES ===');
horariosDisponibles.forEach((horario, index) => {
  console.log(`${index + 1}. ${horario}`);
});

console.log(`\nTotal disponibles: ${horariosDisponibles.length}`);

// Verificar específicamente las 10:30 AM
const esta1030Disponible = horariosDisponibles.includes('10:30 AM');
console.log(`\n¿Está 10:30 AM disponible? ${esta1030Disponible ? 'SÍ' : 'NO'}`);

if (!esta1030Disponible) {
  console.log('\n=== ANÁLISIS DETALLADO DE 10:30 AM ===');
  const inicio1030 = convertirHoraAMinutos('10:30 AM');
  const fin1030 = inicio1030 + duracionServicio;
  console.log(`10:30 AM: inicio ${inicio1030}, fin ${fin1030}`);
  
  citasExistentes.forEach(cita => {
    const inicioCita = convertirHoraAMinutos(cita.hora);
    const finCita = inicioCita + cita.duracionTotal;
    console.log(`Cita ${cita.hora}: inicio ${inicioCita}, fin ${finCita}`);
    console.log(`¿Se solapa con 10:30 AM? ${inicio1030 < finCita && fin1030 > inicioCita}`);
  });
}

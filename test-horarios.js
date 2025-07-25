import { generarHorariosPosibles } from './src/utils/timeUtils.js';

console.log('Horarios generados:');
const horarios = generarHorariosPosibles();
horarios.forEach((horario, index) => {
  console.log(`${index + 1}. ${horario}`);
});

console.log(`\nTotal de horarios: ${horarios.length}`);
console.log(`¿Incluye 10:30 AM? ${horarios.includes('10:30 AM') ? 'SÍ' : 'NO'}`);
console.log(`¿Incluye 5:30 PM? ${horarios.includes('5:30 PM') ? 'SÍ' : 'NO'}`);

/**
 * Utilidades para manejo de tiempo y conversiones de hora
 */

/**
 * Convierte una hora en formato de texto (HH:MM AM/PM) a minutos desde medianoche
 * @param {string} horaTexto - Hora en formato "HH:MM AM/PM"
 * @returns {number} Minutos desde medianoche
 * @example convertirHoraAMinutos("2:30 PM") // 870 (14:30 = 14*60 + 30)
 */
export const convertirHoraAMinutos = (horaTexto) => {
  const [tiempo, periodo] = horaTexto.split(' ');
  const [horas, minutos] = tiempo.split(':');
  let hora24 = parseInt(horas);
  
  if (periodo.toUpperCase() === 'PM' && hora24 !== 12) {
    hora24 += 12;
  } else if (periodo.toUpperCase() === 'AM' && hora24 === 12) {
    hora24 = 0;
  }
  
  return hora24 * 60 + parseInt(minutos);
};

/**
 * Convierte minutos desde medianoche a formato de hora (HH:MM AM/PM)
 * @param {number} minutos - Minutos desde medianoche
 * @returns {string} Hora en formato "HH:MM AM/PM"
 * @example convertirMinutosAHora(870) // "2:30 PM"
 */
export const convertirMinutosAHora = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  const periodo = horas >= 12 ? 'PM' : 'AM';
  const hora12 = horas > 12 ? horas - 12 : (horas === 0 ? 12 : horas);
  return `${hora12}:${mins.toString().padStart(2, '0')} ${periodo}`;
};

/**
 * Configuración de horarios de trabajo del salón
 */
export const HORARIOS_TRABAJO = {
  INICIO: 9 * 60, // 9:00 AM en minutos (540)
  FIN: 18 * 60,   // 6:00 PM en minutos (1080)
  INTERVALO: 30   // Intervalos de 30 minutos
};

/**
 * Valida si una hora está dentro del horario laboral
 * @param {string} hora - Hora en formato "HH:MM AM/PM"
 * @returns {boolean} true si está dentro del horario laboral
 */
export const estaEnHorarioLaboral = (hora) => {
  const minutosHora = convertirHoraAMinutos(hora);
  return minutosHora >= HORARIOS_TRABAJO.INICIO && minutosHora <= HORARIOS_TRABAJO.FIN;
};

/**
 * Valida si una cita completa (inicio + duración) cabe en el horario laboral
 * @param {string} horaInicio - Hora de inicio en formato "HH:MM AM/PM"
 * @param {number} duracion - Duración en minutos
 * @returns {boolean} true si la cita completa cabe en el horario laboral
 */
export const citaCabeEnHorarioLaboral = (horaInicio, duracion) => {
  const minutosInicio = convertirHoraAMinutos(horaInicio);
  const minutosFin = minutosInicio + duracion;
  
  return minutosInicio >= HORARIOS_TRABAJO.INICIO && 
         minutosFin <= HORARIOS_TRABAJO.FIN;
};

/**
 * Genera todos los horarios posibles dentro del horario laboral
 * @returns {string[]} Array de horarios en formato "HH:MM AM/PM"
 */
export const generarHorariosPosibles = () => {
  const horarios = [];
  
  // Generar horarios desde 9:00 AM hasta 5:30 PM (17:30), excluyendo 6:00 PM
  const LIMITE_ULTIMO_HORARIO = 17.5 * 60; // 5:30 PM en minutos (1050)
  
  for (let minutos = HORARIOS_TRABAJO.INICIO; minutos <= LIMITE_ULTIMO_HORARIO; minutos += HORARIOS_TRABAJO.INTERVALO) {
    horarios.push(convertirMinutosAHora(minutos));
  }
  
  return horarios;
};

/**
 * Valida si hay suficiente tiempo para un servicio en un horario dado
 * @param {string} hora - Hora de inicio propuesta
 * @param {number} duracion - Duración del servicio en minutos
 * @returns {object} Resultado de la validación con éxito y mensaje
 */
export const validarTiempoSuficiente = (hora, duracion) => {
  if (!estaEnHorarioLaboral(hora)) {
    return {
      exito: false,
      mensaje: `La hora ${hora} está fuera del horario laboral (9:00 AM - 6:00 PM)`
    };
  }
  
  if (!citaCabeEnHorarioLaboral(hora, duracion)) {
    const horaFin = convertirMinutosAHora(convertirHoraAMinutos(hora) + duracion);
    return {
      exito: false,
      mensaje: `La cita terminaría a las ${horaFin}, fuera del horario laboral (6:00 PM)`
    };
  }
  
  return {
    exito: true,
    mensaje: "Horario válido"
  };
};

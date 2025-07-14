/**
 * Middleware para validar los datos de un servicio antes de crear o actualizar
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarDatosServicio = (req, res, next) => {
  const { categoria, nombre, precio, duracion } = req.body;
  const errores = [];

  // Validar categoría
  const categoriasValidas = ['Tradicional', 'Acrilico', 'Semipermanente'];
  if (!categoria) {
    errores.push("La categoría es obligatoria");
  } else if (!categoriasValidas.includes(categoria)) {
    errores.push(`La categoría debe ser una de: ${categoriasValidas.join(', ')}`);
  }

  // Validar nombre según la categoría
  if (!nombre) {
    errores.push("El nombre del servicio es obligatorio");
  } else {
    const opcionesPorCategoria = {
      Tradicional: ["Manos", "Pies"],
      Acrilico: [
        "Esculpidas largo #1 y #2",
        "Esculpidas largo #3 y #4",
        "Recubrimiento sobre uña natural",
        "Retoque de acrílico",
        "Retiro de acrílico",
      ],
      Semipermanente: [
        "Manos sencillo un solo tono o francés",
        "Manos con decoración",
        "Pies",
      ],
    };

    if (categoria && opcionesPorCategoria[categoria]) {
      const opcionesValidas = opcionesPorCategoria[categoria];
      if (!opcionesValidas.includes(nombre)) {
        errores.push(`El nombre del servicio debe ser uno de: ${opcionesValidas.join(', ')} para la categoría ${categoria}`);
      }
    }
  }

  // Validar precio
  if (!precio) {
    errores.push("El precio es obligatorio");
  } else if (isNaN(precio) || precio <= 0) {
    errores.push("El precio debe ser un número positivo");
  }

  // Validar duración
  if (!duracion) {
    errores.push("La duración es obligatoria");
  } else if (isNaN(duracion) || duracion <= 0) {
    errores.push("La duración debe ser un número positivo en minutos");
  }

  // Si hay errores, devolver respuesta con errores
  if (errores.length > 0) {
    return res.status(400).json({ 
      mensaje: "Datos de servicio inválidos", 
      errores 
    });
  }

  // Si todo está bien, continuar
  next();
};

/**
 * Middleware para validar el ID de un servicio
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validarIdServicio = (req, res, next) => {
  const { id } = req.params;
  
  // Validar que el ID tenga el formato correcto de MongoDB
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      mensaje: "ID de servicio inválido"
    });
  }

  next();
};

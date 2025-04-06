import { Schema, model } from "mongoose";

// Definimos las opciones válidas por categoría
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

const ServicioSchema = new Schema({
  categoria: {
    type: String,
    enum: Object.keys(opcionesPorCategoria), // ["Tradicional", "Acrilico", "Semipermanente"]
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    validate: {
      validator: function (nombre) {
        return opcionesPorCategoria[this.categoria]?.includes(nombre);
      },
      message: (props) =>
        `${props.value} no es un servicio válido para la categoría seleccionada.`,
    },
  },
  precio: { type: Number, required: true },
  duracion: { type: Number, required: true },
},
{
  timestamps: true,
  strict: false,
});

export default model("Servicio", ServicioSchema);

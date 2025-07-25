import mongoose from "mongoose";

const CitaSchema = new mongoose.Schema(
  {
    celular: { type: Number, required: true, index: true },
    fecha: { type: String, required: true, index: true },
    hora: { type: String, required: true, index: true },
    servicio: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Servicio",
        required: true,
      },
    ],
    duracionTotal: { type: Number, required: true },
    precioTotal: { type: Number, required: true },
    estado: {
      type: String,
      default: "Pendiente",
      enum: [
        "Pendiente",
        "Aprobada",
        "Notificada",
        "En progreso",
        "Completada",
        "Cancelada por clienta",
        "Cancelada por salón",
        "No asistió",
      ],
    },
    historial: [
      {
        estado: { type: String, required: true },
        fecha: { type: Date, default: Date.now }, // Guarda la fecha en que cambió de estado
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.model("Cita", CitaSchema);
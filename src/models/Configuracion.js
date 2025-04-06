import mongoose from "mongoose";

const ConfiguracionSchema = new mongoose.Schema({
  horario: { type: Object, required: true },
  bloqueos: [{ type: String }],
},
{
  timestamps: true,
  strict: false,
});

export default mongoose.model("Configuracion", ConfiguracionSchema);

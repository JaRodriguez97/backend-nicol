import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UsuarioSchema = new mongoose.Schema(
  {
    celular: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["admin", "cliente"], default: "cliente" },
    citas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cita" }],
  },
  {
    timestamps: true,
    strict: false,
  }
);

UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Usuario", UsuarioSchema);

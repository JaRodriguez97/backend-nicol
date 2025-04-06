import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Registro de usuario
// export const registrarUsuario = async (req, res) => {
//   try {
//     const { celular, nombre, password, rol } = req.body;
//     let usuario = await Usuario.findOne({ celular });
//     if (usuario)
//       return res.status(400).json({ mensaje: "El usuario ya existe" });

//     usuario = new Usuario({ celular, nombre, password, rol });
//     await usuario.save();

//     res.status(201).json({ mensaje: "Usuario registrado correctamente" });
//   } catch (error) {
//     res.status(500).json({ mensaje: "Error en el servidor", error });
//   }
// };

// Login de usuario
export const loginUsuario = async (req, res) => {
  try {
    const { celular, password } = req.body;
    const usuario = await Usuario.findOne({ celular });
    if (!usuario)
      return res
        .status(400)
        .json({ mensaje: "Número de Celular no existe en la base de datos" });

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido)
      return res.status(400).json({
        mensaje: "Contraseña incorrecta, por favor inténtalo de nuevo",
      });

    res.json({
      token: generarToken(usuario),
      usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password");
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Listar usuarios (solo admin)
export const listarUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin")
      return res.status(403).json({ mensaje: "Acceso denegado" });
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

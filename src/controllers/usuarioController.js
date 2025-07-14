import dotenv from "dotenv";
import {
  buscarUsuarioPorCelular,
  verificarPassword,
  generarToken,
  obtenerUsuarioPorId,
  obtenerTodosUsuarios,
  registrarNuevoUsuario
} from "../services/usuarioService.js";

dotenv.config();

// Registro de usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { celular, nombre, password, rol = "cliente" } = req.body;
    
    // Verificar si el usuario ya existe
    let usuario = await buscarUsuarioPorCelular(celular);
    if (usuario)
      return res.status(400).json({ mensaje: "El usuario ya existe" });

    // Crear nuevo usuario
    usuario = await registrarNuevoUsuario({ celular, nombre, password, rol });

    res.status(201).json({ 
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        celular: usuario.celular,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Login de usuario
export const loginUsuario = async (req, res) => {
  try {
    const { celular, password } = req.body;
    const usuario = await buscarUsuarioPorCelular(celular);
    if (!usuario)
      return res
        .status(400)
        .json({ mensaje: "Número de Celular no existe en la base de datos" });

    const esValido = await verificarPassword(password, usuario.password);
    if (!esValido)
      return res.status(400).json({
        mensaje: "Contraseña incorrecta, por favor inténtalo de nuevo",
      });

    res.json({
      token: generarToken(usuario, process.env.JWT_SECRET),
      usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await obtenerUsuarioPorId(req.usuario.id);
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
    
    const usuarios = await obtenerTodosUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

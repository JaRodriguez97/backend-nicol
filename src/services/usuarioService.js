import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Busca un usuario por su número de celular
 * @param {number} celular - Número de celular del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
export const buscarUsuarioPorCelular = async (celular) => {
  return await Usuario.findOne({ celular });
};

/**
 * Verifica si la contraseña es válida
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada almacenada
 * @returns {Promise<boolean>} true si la contraseña es válida
 */
export const verificarPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Genera un token JWT para el usuario
 * @param {Object} usuario - Datos del usuario
 * @param {string} secretKey - Clave secreta para firmar el token
 * @param {string} expiresIn - Tiempo de expiración del token
 * @returns {string} Token JWT generado
 */
export const generarToken = (usuario, secretKey, expiresIn = "7d") => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    secretKey,
    { expiresIn }
  );
};

/**
 * Obtiene un usuario por su ID sin devolver la contraseña
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
export const obtenerUsuarioPorId = async (usuarioId) => {
  return await Usuario.findById(usuarioId).select("-password");
};

/**
 * Obtiene todos los usuarios sin devolver contraseñas
 * @returns {Promise<Array>} Lista de usuarios
 */
export const obtenerTodosUsuarios = async () => {
  return await Usuario.find().select("-password");
};

/**
 * Registra un nuevo usuario en la base de datos
 * @param {Object} datosUsuario - Datos del usuario a registrar
 * @returns {Promise<Object>} Usuario creado
 */
export const registrarNuevoUsuario = async (datosUsuario) => {
  const usuario = new Usuario(datosUsuario);
  return await usuario.save();
};

# 💅 Backend Nicol Nails - API REST

> **Sistema de gestión de citas para salón de uñas** - ¡Profesional, seguro y fácil de usar!

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.13-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![Tests](https://img.shields.io/badge/Tests-95_passing-brightgreen.svg)](https://jestjs.io/)

---

## 🚀 Características Principales

- ✅ **Creación de citas sin autenticación** - Las clientas pueden agendar fácilmente
- 🔐 **Autenticación JWT** - Acceso seguro para administradores
- 📱 **Consulta por celular** - Buscar citas usando número de teléfono
- 🛡️ **Rate limiting** - Protección contra spam y abuso
- 🔒 **Validación robusta** - Datos siempre consistentes
- 📊 **Gestión completa** - CRUD para citas, servicios y usuarios
- 🧪 **95 tests pasando** - Código confiable y bien probado

---

## 📋 Tabla de Contenidos

1. [Instalación Rápida](#-instalación-rápida)
2. [Endpoints de Citas](#-endpoints-de-citas)
3. [Endpoints de Servicios](#-endpoints-de-servicios)
4. [Endpoints de Usuarios](#-endpoints-de-usuarios)
5. [Autenticación](#-autenticación)
6. [Ejemplos de Uso](#-ejemplos-de-uso)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Testing](#-testing)

---

## 🛠 Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/JaRodriguez97/backend-nicol.git
cd backend-nicol

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm run prod
```

---

## 💅 Endpoints de Citas

### 🆕 Crear Cita (Público)
**¡La clienta puede agendar sin registro!**

```http
POST /api/citas
Content-Type: application/json

{
  "celular": 3009876543,
  "fecha": "2025-12-31",
  "hora": "10:00 AM",
  "servicio": ["64f8a8b3c4b5d6e7f8g9h0i1"],
  "estado": "Pendiente"
}
```

**Respuesta exitosa:**
```json
{
  "mensaje": "Cita creada con éxito",
  "cita": {
    "_id": "64f8a8b3c4b5d6e7f8g9h0i2",
    "celular": 3009876543,
    "fecha": "2025-12-31",
    "hora": "10:00 AM",
    "servicio": ["64f8a8b3c4b5d6e7f8g9h0i1"],
    "estado": "Pendiente",
    "createdAt": "2025-01-14T19:00:00.000Z"
  }
}
```

---

### 📱 Consultar Citas por Celular (Público)
**¡Perfecto para que las clientas vean sus citas!**

```http
GET /api/citas/celular/3009876543
```

**Respuesta:**
```json
[
  {
    "_id": "64f8a8b3c4b5d6e7f8g9h0i2",
    "celular": 3009876543,
    "fecha": "2025-12-31",
    "hora": "10:00 AM",
    "estado": "Aprobada",
    "servicio": {
      "nombre": "Manos",
      "precio": 25000,
      "duracion": 60
    }
  }
]
```

---

### 👑 Obtener Todas las Citas (Solo Admin)
```http
GET /api/citas
Authorization: Bearer <admin_token>
```

---

### ✏️ Actualizar Estado de Cita (Autenticado)
```http
PUT /api/citas/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "Aprobada",
  "celular": 3009876543
}
```

**Estados disponibles:**
- `Pendiente` - Recién creada
- `Aprobada` - Confirmada por el salón
- `Notificada` - Cliente notificado
- `En progreso` - Servicio en curso
- `Completada` - Terminada
- `Cancelada por clienta` - Cliente canceló
- `Cancelada por salón` - Salón canceló
- `No asistió` - Cliente no llegó

---

### 🗑️ Cancelar Cita (Cliente o Admin)
```http
DELETE /api/citas/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "celular": 3009876543
}
```

---

## 🎨 Endpoints de Servicios

### 📋 Obtener Servicios (Público)
**¡Para mostrar en tu frontend!**

```http
GET /api/servicios
```

**Respuesta:**
```json
{
  "Tradicional": [
    {
      "_id": "64f8a8b3c4b5d6e7f8g9h0i1",
      "categoria": "Tradicional",
      "nombre": "Manos",
      "precio": 25000,
      "duracion": 60
    }
  ],
  "Acrilico": [
    {
      "_id": "64f8a8b3c4b5d6e7f8g9h0i3",
      "categoria": "Acrilico",
      "nombre": "Esculpidas largo #1 y #2",
      "precio": 40000,
      "duracion": 90
    }
  ],
  "Semipermanente": [...]
}
```

---

### 🔍 Obtener Servicio Específico
```http
GET /api/servicios/:id
```

---

### 👑 Crear Servicio (Solo Admin)
```http
POST /api/servicios
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "categoria": "Tradicional",
  "nombre": "Manos",
  "precio": 25000,
  "duracion": 60
}
```

**Categorías disponibles:**
- `Tradicional` - Manos, Pies
- `Acrilico` - Esculpidas, Recubrimiento, Retoque, Retiro
- `Semipermanente` - Manos sencillo, Manos con decoración, Pies

---

### 👑 Actualizar/Eliminar Servicio (Solo Admin)
```http
PUT /api/servicios/:id
DELETE /api/servicios/:id
Authorization: Bearer <admin_token>
```

---

## 👤 Endpoints de Usuarios

### 🔐 Login
```http
POST /api/usuarios/login
Content-Type: application/json

{
  "celular": 3001234567,
  "password": "tu_password"
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "64f8a8b3c4b5d6e7f8g9h0i4",
    "celular": 3001234567,
    "nombre": "Admin",
    "rol": "admin"
  }
}
```

---

### 👤 Obtener Perfil
```http
GET /api/usuarios/me
Authorization: Bearer <token>
```

---

### 👑 Listar Usuarios (Solo Admin)
```http
GET /api/usuarios
Authorization: Bearer <admin_token>
```

---

## 🔑 Autenticación

### Formato del Token
```http
Authorization: Bearer <tu_jwt_token>
```

### Roles Disponibles
- **`admin`** - Acceso completo al sistema
- **`cliente`** - Acceso limitado a sus propias citas

---

## 🎯 Ejemplos de Uso

### Flujo Completo: Crear una Cita

1. **La clienta consulta servicios disponibles:**
```bash
curl -X GET "http://localhost:3000/api/servicios"
```

2. **La clienta crea una cita:**
```bash
curl -X POST "http://localhost:3000/api/citas" \
  -H "Content-Type: application/json" \
  -d '{
    "celular": 3009876543,
    "fecha": "2025-12-31",
    "hora": "10:00 AM",
    "servicio": ["64f8a8b3c4b5d6e7f8g9h0i1"]
  }'
```

3. **La clienta consulta sus citas:**
```bash
curl -X GET "http://localhost:3000/api/citas/celular/3009876543"
```

4. **El admin aprueba la cita:**
```bash
curl -X PUT "http://localhost:3000/api/citas/64f8a8b3c4b5d6e7f8g9h0i2" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Aprobada",
    "celular": 3009876543
  }'
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000

# Base de datos
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nails

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# CORS
frontend=https://tu-frontend.com
```

---

## 🧪 Testing

### 🛡️ Arquitectura de Testing Segura

**Testing profesional con base de datos en memoria:**

- 🗄️ **MongoDB en memoria** - Tests completamente aislados
- 🔒 **Validaciones de seguridad** - Prevención de conexiones accidentales
- 🧹 **Limpieza automática** - Cada test inicia con datos frescos
- ⚡ **Rendimiento optimizado** - No requiere BD externa

### Configuración de Testing

**Archivo `.env.test`:**
```env
# Configuración específica para testing
NODE_ENV=test
PORT=5001
JWT_SECRET=test_secret_key

# Base de datos en memoria (recomendado)
MONGO_URI_TEST=mongodb://localhost:27017/nicol_nails_test

CORS_ORIGIN=http://localhost:4200
TEST_TIMEOUT=30000
TEST_MAX_WORKERS=1
```

**Características de seguridad:**
- ✅ Verificación automática de `NODE_ENV=test`
- ✅ Validación de URIs de testing
- ✅ MongoDB Memory Server integrado
- ✅ Cleanup automático después de cada test

### Ejecutar Tests
```bash
# Todos los tests (con BD en memoria)
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests verbosos
npm run test:verbose
```

### 📊 Cobertura de Tests
- ✅ **95 tests pasando** (20.5s)
- ✅ **Citas API** - 12/12 tests
- ✅ **Servicios API** - 7/7 tests
- ✅ **Autenticación** - 8/8 tests
- ✅ **Middlewares** - 16/16 tests
- ✅ **Integración** - 8/8 tests
- ✅ **Validaciones** - 44/44 tests

### 🔧 Tecnologías de Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs HTTP
- **MongoDB Memory Server** - Base de datos en memoria
- **Cross-env** - Variables de entorno multiplataforma

---

## 🚦 Rate Limiting

### Límites Actuales
- **Login**: 5 intentos por 15 minutos
- **Crear citas**: 10 citas por hora
- **General**: 100 requests por 15 minutos

### Respuesta de Rate Limit
```json
{
  "mensaje": "Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos"
}
```

---

## 📱 Validaciones

### Número de Celular
- ✅ Debe comenzar con 3
- ✅ Debe tener exactamente 10 dígitos
- ✅ Ejemplo válido: `3009876543`

### Fecha y Hora
- ✅ Formato fecha: `YYYY-MM-DD`
- ✅ Formato hora: `HH:MM AM/PM` (12 horas)
- ✅ Ejemplos válidos: `10:00 AM`, `02:30 PM`, `11:45 PM`
- ✅ No se permiten fechas pasadas

### Estados de Cita
- ✅ Solo estados predefinidos
- ✅ Validación estricta
- ✅ Historial de cambios

---

## 🐛 Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|----------|
| `400` | Datos inválidos | Celular mal formateado |
| `401` | No autorizado | Token inválido |
| `403` | Prohibido | Sin permisos de admin |
| `404` | No encontrado | Cita inexistente |
| `429` | Rate limit | Muchas solicitudes |
| `500` | Error servidor | Error interno |

---

## 🎉 ¡Y eso es todo!

¿Questions? ¿Bugs? ¿Mejoras? 
**¡Crea un issue y te ayudo rapidito!** 🚀

---

**Hecho con 💖 para Nicol Nails**

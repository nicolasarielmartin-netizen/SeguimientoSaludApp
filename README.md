# Cuidado Conciente · Seguimiento de Salud

Aplicación web para registrar y seguir indicadores de salud (por ejemplo, presión arterial, peso o glucosa), síntomas y hábitos, con gráficas de evolución e informes descargables en PDF.

🌐 **Demo:** [cuidadoconcienteapp.vercel.app](https://cuidadoconcienteapp.vercel.app/)

## Funcionalidades

- Registro e inicio de sesión de usuarios con sesión mediante JWT en cookie `httpOnly`.
- Indicadores de salud con sus registros (valor, valor secundario opcional, fecha y notas).
- Registro de síntomas.
- Gráficas de evolución con Recharts.
- Informes por rango de fechas exportables a PDF.

## Tecnologías

**Cliente (`client/`)**
- React 19 + Vite
- React Router
- React Hook Form + Zod
- Tailwind CSS
- Recharts, date-fns, lucide-react
- Axios

**Servidor (`server/`)**
- Node.js (ES Modules) + Express 5
- MongoDB con Mongoose
- Autenticación con JWT y bcryptjs
- Validación con Zod
- Seguridad: Helmet, CORS, cookie-parser y express-rate-limit
- PDFKit para los informes
- Nodemailer ⚠️ (en dependencias; confirma si se usa)

## Estructura del proyecto

```
SeguimientoSaludApp/
├── client/          # Frontend (React + Vite)
│   └── src/
└── server/          # Backend (Express + MongoDB)
    └── src/
        └── server.js  # Punto de entrada
```

## Requisitos previos

- Node.js 20 o superior ⚠️ (confirma la versión mínima que usas)
- npm
- MongoDB en local o un clúster en MongoDB Atlas

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicolasarielmartin-netizen/SeguimientoSaludApp.git
cd SeguimientoSaludApp
```

### 2. Configurar el servidor

```bash
cd server
npm install
cp env.example .env
```

Edita `.env` con tus valores (ver [Variables de entorno](#variables-de-entorno)).

### 3. Configurar el cliente

```bash
cd ../client
npm install
```

⚠️ Indica aquí cómo apunta el cliente a la API (por ejemplo, un `.env` con `VITE_API_URL=http://localhost:5000`). Confirma el nombre de la variable en el código.

## Variables de entorno

定义 en `server/.env`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `5000` |
| `NODE_ENV` | `development` o `production`. En producción la cookie usa `secure` | `development` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://127.0.0.1:27017/cuidado_conciente` |
| `JWT_SECRET` | Clave para firmar los JWT. Debe ser larga y aleatoria | *(genera una con `openssl rand -base64 48`)* |
| `CLIENT_URL` ⚠️ | Origen permitido por CORS | `http://localhost:5173` |

> ⚠️ No uses espacios en el nombre de la base de datos. El ejemplo original usa `Cuidado Conciente`, y conviene cambiarlo por `cuidado_conciente`.

## Ejecución

Abre dos terminales.

**Servidor (desarrollo, con recarga automática):**
```bash
cd server
npm run dev
```

**Cliente:**
```bash
cd client
npm run dev
```

La aplicación queda en `http://localhost:5173` y la API en `http://localhost:5000`.

### Producción

```bash
# Servidor
cd server
npm start

# Cliente
cd client
npm run build     # genera client/dist
npm run preview   # vista previa local del build
```

## Scripts disponibles

| Ubicación | Comando | Qué hace |
|---|---|---|
| `server/` | `npm run dev` | Arranca el servidor con nodemon |
| `server/` | `npm start` | Arranca el servidor con Node |
| `server/` | `npm test` | ⚠️ Todavía no hay tests (placeholder de npm) |
| `client/` | `npm run dev` | Servidor de desarrollo de Vite |
| `client/` | `npm run build` | Build de producción |
| `client/` | `npm run lint` | Linter con oxlint |
| `client/` | `npm run preview` | Sirve el build de producción |

## API (resumen)

⚠️ Completa esta lista con los endpoints reales.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario autenticado |
| GET/POST/PUT/DELETE | `/api/indicators` | Gestión de indicadores |
| POST | `/api/indicators/:id/records` | Añadir registro a un indicador |
| GET/POST/PUT/DELETE | `/api/symptoms` | Gestión de síntomas |
| GET | `/api/reports/pdf` | Informe en PDF por rango de fechas |

Todas las rutas de datos requieren autenticación.

## Seguridad

- Las contraseñas se guardan con bcrypt.
- El token se envía en una cookie `httpOnly`. En producción la cookie es `secure`.
- Todas las consultas se filtran por el usuario autenticado, de modo que cada usuario solo accede a sus datos.
- Los informes PDF se sirven con `Cache-Control: no-store`.
- No subas el archivo `.env` al repositorio.

## Estado del proyecto

Proyecto en desarrollo. Pendiente:
- Límite de intentos de login efectivo (la ruta de login tiene definido el limitador, pero hay que revisar el orden de las rutas).
- Tests automatizados.
- Protección CSRF adicional para peticiones no GET.

## Contribuir

1. Crea una rama desde `main` (`git checkout -b feature/mi-cambio`).
2. Haz tus cambios y confirma con mensajes claros.
3. Abre un Pull Request.

## Licencia

⚠️ Define la licencia. El `server/package.json` declara `ISC`, pero el cliente no tiene una.

## Autor

**Nicolás Ariel Martin** · [@nicolasarielmartin-netizen](https://github.com/nicolasarielmartin-netizen)

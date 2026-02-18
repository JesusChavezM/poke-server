# Poke-Server — Uso

## Resumen

Servidor REST para la _Pokédex Explorer_. Provee endpoints de autenticación (Google One-Tap / GSI) y endpoints protegidos para listar y consultar Pokémon. Incluye protección mediante JWT y configuración CORS/COOP para que Google Sign-In funcione correctamente.

---

## Prerrequisitos

- Node.js >= 20 (probado con Node 24)
- Yarn o npm
- MongoDB (Atlas)
- Cuenta en Google Cloud con _OAuth 2.0 Client ID_ (JavaScript origin configurado)
- Variables de entorno (ver sección [Environment](#environment))

---

## Environment

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority"
GOOGLE_CLIENT_ID="<tu-google-client-id>.apps.googleusercontent.com"
JWT_SECRET="<un-secreto-largo-y-seguro>"
FRONTEND_ORIGIN="http://localhost:9000"
```

> **Notas:**
>
> - `MONGO_URI`: si usas MongoDB Atlas, asegúrate de permitir conexiones desde la IP del entorno de ejecución.
> - `GOOGLE_CLIENT_ID`: añade los _Authorized JavaScript origins_ correspondientes en Google Cloud Console.
> - `FRONTEND_ORIGIN`: utilizado por la configuración CORS del servidor.

---

## Instalación (local)

```bash
git clone <tu-repo>
cd poke-server
yarn install
```

---

## Ejecución del servidor

Para iniciar el servidor en modo desarrollo, ejecuta el siguiente comando. El script ya está configurado en el `package.json`:

```bash
yarn dev
```

---

# Poke-Server — Documentación

## Endpoints

### `POST /api/auth/google`

Valida el `idToken` de Google y devuelve un JWT propio de sesión.

### `GET /api/pokemon/`

Retorna una lista paginada de Pokémon con los campos: `id`, `name`, `image` y `primaryType`.

### `GET /api/pokemon/:nameOrId`

Retorna la información completa de un Pokémon: tipos, estadísticas y habilidades.

---

## CORS / COOP

Para que Google Sign-In funcione correctamente, el servidor requiere el siguiente header:

```
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

> Este header evita que el popup de autenticación de Google se abra en blanco.

---

## Troubleshooting

| Síntoma                        | Causa probable                                                  |
| ------------------------------ | --------------------------------------------------------------- |
| `502 timeout`                  | Revisar la URL de la API o la conexión a la base de datos       |
| `401 Unauthorized`             | Falta el header `Authorization` en la petición                  |
| `Mongoose buffering timed out` | Revisar que `MONGO_URI` sea correcta y que la IP esté permitida |
| `GSI origin not allowed`       | Agregar el origen en Google Cloud Console                       |

---

## Arquitectura

El servidor actúa como **Backend for Frontend (BFF)** para la aplicación Pokédex Explorer.

**Responsabilidades:**

- Abstraer la PokeAPI pública del cliente
- Normalizar datos (tipos, imagen oficial, estadísticas)
- Autenticar usuarios mediante Google Identity Services
- Emitir un JWT propio para proteger los endpoints
- Persistir usuarios en MongoDB

> El cliente nunca consume directamente la PokeAPI ni opera con tokens de Google.
> El backend es la única fuente de autorización.

---

## Autenticación — Google + JWT interno

Para hacer la autenticación más dinámica y transparente para el usuario, se implementó el inicio de sesión con Google. El flujo es el siguiente:

1. El cliente obtiene un `idToken` desde Google.
2. Lo envía al endpoint `POST /api/auth/google`.
3. El servidor valida el token con Google.
4. Se emite un `sessionToken` (JWT propio).
5. El cliente utiliza ese JWT para acceder a las rutas protegidas.

### ¿Por qué este enfoque?

| Capa            | Responsabilidad                       |
| --------------- | ------------------------------------- |
| **Google**      | Verifica la identidad del usuario     |
| **JWT interno** | Controla la sesión dentro del sistema |

Esta separación permite:

- Sesiones revocables desde el servidor
- Expiración configurable
- Asignación de permisos internos
- Menor latencia en peticiones autenticadas

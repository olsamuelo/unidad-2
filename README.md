<<<<<<< HEAD
<div align="center">

<img src="docs/banner.svg" alt="GIR6091 · TASKS" width="100%" />

<br />

[![Angular](https://img.shields.io/badge/Angular-standalone-2E5FA3?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**Sistema de gestión de tareas full-stack** desarrollado para la asignatura
**Automatización de Infraestructura Digital I** — Ingeniería en Redes Inteligentes
y Ciberseguridad, UTNG.

</div>

---

## Contenido

- [Resumen](#resumen)
- [Stack técnico](#stack-técnico)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Puesta en marcha](#puesta-en-marcha)
- [Endpoints de la API](#endpoints-de-la-api)
- [Sistema de diseño](#sistema-de-diseño)
- [Autor](#autor)

---

## Resumen

Monorepo con dos proyectos independientes que se comunican por HTTP:

| Proyecto  | Descripción                                                     | Puerto  |
| --------- | ---------------------------------------------------------------| ------- |
| `jp-api`  | API REST en NestJS (arquitectura hexagonal) + Prisma + Postgres | `3000`  |
| `jp-app`  | SPA en Angular (standalone, sin NgModules) + Angular Material   | `4200`  |

**Funcionalidad cubierta:**

- 🔐 Autenticación con JWT (login, protección de rutas, expiración de sesión)
- 👤 Menú personalizado según el rol del usuario (`ADMIN` / `USER`)
- ✅ CRUD completo de tareas (crear, listar, actualizar, eliminar)
- 🛡️ Rutas protegidas tanto en frontend (`authGuard`) como en backend (`JwtAuthGuard`)
- 🎨 Interfaz propia, minimalista, en modo oscuro

## Stack técnico

<table>
<tr>
<td valign="top" width="50%">

**Backend — `jp-api`**
- NestJS 11 · arquitectura hexagonal (domain / application / infrastructure)
- Prisma ORM 7 (driver adapter `@prisma/adapter-pg`)
- PostgreSQL 16 (contenedor Docker)
- Passport + `@nestjs/jwt`
- `class-validator` / `class-transformer`
- Swagger (`/api/docs`)

</td>
<td valign="top" width="50%">

**Frontend — `jp-app`**
- Angular (standalone components, control flow `@if`/`@for`)
- Angular Material (re-skinned, tema oscuro propio)
- Signals para estado reactivo (sesión, listas, carga)
- Guards e interceptores funcionales
- Formularios reactivos con validación

</td>
</tr>
</table>

## Arquitectura

```mermaid
flowchart LR
    subgraph Cliente
        A[Angular SPA<br/>jp-app :4200]
    end

    subgraph Servidor
        B[NestJS API<br/>jp-api :3000]
        C[(PostgreSQL<br/>:54320)]
    end

    A -- "Bearer JWT" --> B
    B -- Prisma / adapter-pg --> C
```

## Estructura del repositorio

```
U2/
├── jp-api/                     API REST (NestJS)
│   ├── src/
│   │   ├── auth/               login, guards, estrategia JWT
│   │   ├── task/                dominio de tareas (hexagonal)
│   │   │   ├── domain/          entidad + interfaz de repositorio
│   │   │   ├── application/     casos de uso (create, update, delete, get)
│   │   │   └── infrastructure/  controller, persistencia Prisma
│   │   └── prisma/               servicio de conexión
│   └── prisma/schema.prisma
│
├── jp-app/                     SPA (Angular standalone)
│   └── src/app/
│       ├── core/                servicios, guards, interceptores, modelos
│       ├── features/
│       │   ├── auth/login/
│       │   └── tasks/           lista + diálogo crear/editar
│       └── shared/header/       barra superior, menú por rol
│
└── docs/
    └── banner.svg
```

## Puesta en marcha

### Requisitos
- Node.js LTS
- Docker Desktop (para PostgreSQL)

### 1. Backend

```bash
cd jp-api
npm install

# variables de entorno
cat > .env << 'EOF'
DATABASE_URL="postgresql://admin:admin123@localhost:54320/rcs_db?schema=public"
JWT_SECRET="una_clave_secreta_larga_para_jwt_gir6091"
PORT=3000
EOF

docker compose up -d          # levanta Postgres
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed            # crea el usuario admin
npm run start:dev
```

API disponible en `http://localhost:3000/api/v1` · Swagger en `http://localhost:3000/api/docs`.

### 2. Frontend

```bash
cd jp-app
npm install
npm start
```

App disponible en `http://localhost:4200`.

### Usuario de prueba

| Correo             | Contraseña   | Rol   |
| ------------------- | ------------ | ----- |
| `admin@rcs.com`     | `Admin123!`  | ADMIN |

## Endpoints de la API

| Método   | Ruta                    | Descripción                  | Auth |
| -------- | ----------------------- | ----------------------------- | :--: |
| `POST`   | `/api/v1/auth/login`    | Inicia sesión, devuelve JWT   |  —   |
| `GET`    | `/api/v1/tasks`         | Lista todas las tareas        |  ✅  |
| `POST`   | `/api/v1/tasks`         | Crea una tarea                |  ✅  |
| `GET`    | `/api/v1/tasks/:id`     | Obtiene una tarea por id      |  ✅  |
| `PATCH`  | `/api/v1/tasks/:id`     | Actualiza una tarea           |  ✅  |
| `DELETE` | `/api/v1/tasks/:id`     | Elimina una tarea             |  ✅  |

## Sistema de diseño

Interfaz minimalista en modo oscuro, sin texturas ni ruido visual: negro
sólido con un único resplandor azul discreto. Cada acción del CRUD tiene un
color fijo para que el estado de la interfaz se lea de un vistazo, sin
depender de texto:

| Color | Uso | Hex |
| ----- | --- | --- |
| 🔵 Azul | Crear / acción principal | `#2E5FA3` |
| 🟢 Verde oscuro | Editar | `#2F6B4F` |
| 🔴 Rojo oscuro | Borrar | `#8C2F35` |
| ⚫ Negro azulado | Fondo | `#05070B` |

**Tipografía:** `Space Grotesk` para títulos y marca, `Inter` para texto, y
`JetBrains Mono` para datos (fechas, IDs, estados) — un guiño a la estética
de terminal propia del perfil de Redes y Ciberseguridad.

**Legibilidad:** todo campo de texto (inputs, textareas, selects y sus
paneles desplegables) fuerza texto blanco sobre superficie oscura,
incluyendo estados de autocompletado del navegador — nunca texto negro
invisible sobre fondo negro. Botones planos, sin sombra, con transición
suave al interactuar.

## Autor

**Juan Pablo** — Ingeniería en Redes Inteligentes y Ciberseguridad, UTNG.
Grupo GIR6091-E.
=======
# unidad-2
>>>>>>> 398aa2f1a5e9805c8ac63d60ee678fc0ac6fe3cd

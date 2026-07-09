# GIR6091 - Frontend de Gestión de Tareas (Angular + Angular Material)

Proyecto standalone (sin NgModules) que cumple con el instrumento de evaluación de
**Automatización de Infraestructura Digital I**: login, menú personalizado por rol,
CRUD completo de tareas y protección de rutas.

## Requisitos previos
- Node.js LTS instalado
- La API `rcs-gir6091-api` corriendo en `http://localhost:3000`

## Instalación

```bash
npm install
```

## Levantar el proyecto

```bash
npm start
```

Se abre en `http://localhost:4200`.

## Usuario de prueba (viene del seed de la API)
- Correo: `admin@rcs.com`
- Contraseña: `Admin123!`

## Estructura

```
src/app/
  core/
    guards/auth.guard.ts        -> protege la ruta /tasks
    interceptors/auth.interceptor.ts -> agrega el Bearer token a cada request
    services/auth.service.ts    -> login, logout, estado de sesión (signals)
    services/task.service.ts    -> CRUD contra /api/v1/tasks
    models/                     -> interfaces de Task y Auth
  features/
    auth/login/                 -> pantalla de inicio de sesión
    tasks/task-list/            -> listado + acciones (editar/eliminar/crear)
    tasks/task-dialog/          -> formulario reactivo (crear y editar)
  shared/header/                -> barra superior con menú según rol (ADMIN/USER)
```

## Notas importantes
- Si cambias el puerto o la URL de la API, edítalo en
  `src/environments/environment.development.ts` (desarrollo) y
  `src/environments/environment.ts` (producción). Ambos usan la clave `apiUrl`.
- El backend (`rcs-gir6091-api`) requerÍa dos correcciones para que esto funcionara:
  1. `AuthModule` no estaba registrado en `app.module.ts` (el login no existía en runtime).
  2. `TaskController` no tenía `@UseGuards(JwtAuthGuard)` (rutas sin protección).
  Ambas ya vienen corregidas en el zip del backend que se entregó junto con este proyecto.

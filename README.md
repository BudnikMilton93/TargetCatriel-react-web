# Target Catriel - React Web

Proyecto fullstack de una escuela de inglés con frontend React + Vite, backend API bajo `api/` y base de datos PostgreSQL con Prisma.

## Estado actual

El proyecto ya tiene implementado lo siguiente:

- Frontend de páginas públicas y dashboards por rol
- Sistema mock de autenticación con roles
- Dashboard para profesor, alumno, admin y marketing
- Backend de APIs REST bajo `/api`
- Modelo de datos Prisma con migración inicial y seed
- Contenedores Docker para PostgreSQL local

La parte aún pendiente es la integración final entre algunos paneles y la API real, junto con refinamientos UX y pruebas end-to-end.

## Stack

- React 19 + Vite
- React Router
- Prisma + PostgreSQL
- TypeScript para endpoints de API
- Docker Compose para base de datos local

## Estructura principal

```bash
src/                  # frontend
api/                  # endpoints serverless / vercel-like
prisma/               # schema y seed
public/               # assets estáticos
scripts/              # utilidades de desarrollo

documents/            # roadmap y documentación del proyecto
```

## Requisitos

- Node.js 20+
- npm
- Docker Desktop o Docker Engine

## Arranque rápido

```bash
npm install
npm run db:up
npx prisma generate
npx prisma migrate deploy
npm run dev
npm run dev:api
```

## Usuarios de prueba

Los usuarios de prueba están definidos en `src/context/AuthContext.jsx` y corresponden a los IDs de la base de datos semilla:

- `maria@target.com` → Profesor
- `juan@student.com` → Alumno
- `admin@target.com` → Administrador
- `marketing@target.com` → Marketing

Cualquier contraseña funciona en el mock de autenticación.

## Documentación del proyecto

- [documents/ROADMAP_INDEX.md](documents/ROADMAP_INDEX.md)
- [documents/ROADMAP_PROFESOR.md](documents/ROADMAP_PROFESOR.md)
- [documents/ROADMAP_ALUMNO.md](documents/ROADMAP_ALUMNO.md)
- [documents/ROADMAP_ADMINISTRADOR.md](documents/ROADMAP_ADMINISTRADOR.md)
- [documents/ROADMAP_MARKETING.md](documents/ROADMAP_MARKETING.md)
- [documents/TESTING.md](documents/TESTING.md) — guía de pruebas funcionales y referencia de endpoints (cURL)
- [documents/ARQUITECTURA.md](documents/ARQUITECTURA.md) — modelo de datos y arquitectura del proyecto
- [api/README.md](api/README.md)

## Importante

Este README reemplaza la plantilla inicial de Vite y refleja el estado real del proyecto en agosto de 2026.

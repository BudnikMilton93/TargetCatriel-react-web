# 📋 ROADMAP - TARGET CATRIEL PROYECTO FULLSTACK

## ✅ FASE 1: Frontend — COMPLETADA

### 1.1 Reorganizar carpetas ✅
- Estructura de dashboard por rol
- Context, páginas, componentes organizados

### 1.2 Crear componentes dashboard ✅
- DashboardProfesor (bloques, módulos, alumnos)
- DashboardAlumno (módulos, recursos, progreso)
- DashboardAdmin (vista consolidada)
- DashboardMarketing (CRUD noticias, viajes, galería)

### 1.3 Configurar AuthContext ✅
- Mock Supabase Auth (sin dependencia externa)
- 4 usuarios de prueba
- Roles combinables

### 1.4 Configurar React Router ✅
- Rutas públicas y privadas
- RoleGuard para protección
- Redirecciones automáticas

### 1.5 Integrar content.json ✅
- DashboardMarketing usa datos temporales
- Preparado para APIs futuras

### 1.6 Validar flujo ✅
- Compilación exitosa
- Estructura lista para desarrollo

---

## ⏳ FASE 2: Backend — Base de datos local

### 2.1 Crear docker-compose.yml
- PostgreSQL 16 local
- Variables .env.local

### 2.2 Definir schema.prisma
- Tablas usuarios, roles, bloques, módulos, contenidos
- Relaciones según modelo en Estructura.MD

### 2.3 Levantar Postgres + Prisma
- `docker compose up -d`
- `npx prisma migrate dev`

### 2.4 Seeding inicial
- Datos de prueba para testing

---

## ⏳ FASE 3: Backend — APIs (Vercel Functions)

### 3.1 Estructura /api
- /api/_lib (db.ts, auth.ts, roles.ts)
- Handlers para cada entidad

### 3.2 CRUD Marketing (noticias, viajes, galería, sobre nosotros)
- POST, GET, PUT, DELETE

### 3.3 CRUD Profesor (bloques, módulos, contenidos)
- Gestión de flujo educativo

### 3.4 CRUD Alumno (respuestas, asistencias, progreso)
- Endpoints de interacción

### 3.5 Endpoints Admin
- Vistas consolidadas, reportes

---

## ⏳ FASE 4: Integración

### 4.1 Conectar frontend a APIs
- Reemplazar mocks en services/api.js
- Fetch real a Vercel Functions

### 4.2 Autenticación real Supabase
- Login con email/password
- Sesión persistente

### 4.3 Test flujo completo
- Profesor → Módulo → Alumno → Respuesta

### 4.4 Deploy local validado
- Todo funcionando en dev

---

## 📌 Estado actual:
- **Fase 1**: ✅ LISTA
- **Fase 2**: ⏳ Próxima
- **Compilación**: ✅ Sin errores
- **Usuarios prueba**: 4 disponibles
- **Estructura**: Lista para APIs

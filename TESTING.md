# 🚀 GUÍA DE PRUEBA - FASE 1 Frontend

## Iniciar el servidor de desarrollo

```bash
cd /Users/miltonjeremiasbudnik/Workspace/TargetCatriel-react-web/TargetCatriel-react-web
npm run dev
```

Luego abre: **http://localhost:5173**

---

## 🔐 Usuarios de Prueba

Todos funcionan con **cualquier contraseña**:

| Email | Rol(es) | Dashboard |
|-------|---------|-----------|
| `profesor@target.com` | profesor | `/dashboard/profesor` |
| `alumno@target.com` | alumno | `/dashboard/alumno` |
| `admin@target.com` | admin, profesor | `/dashboard/admin` |
| `marketing@target.com` | marketing, alumno | `/dashboard/marketing` |

---

## 🧪 Flujo de Prueba Recomendado

### 1. **Página Pública (sin login)**
- Visita http://localhost:5173
- Ve el home, clases, viajes, etc.
- Nota el botón "Ingresar" en el header

### 2. **Login como Profesor**
- Click en "Ingresar" (header)
- Email: `profesor@target.com`
- Contraseña: cualquiera (ej: "123")
- ✅ Redirige automáticamente a `/dashboard/profesor`
- Ver: Bloques, módulos, alumnos

### 3. **Login como Alumno**
- Vuelve a http://localhost:5173
- Logout (botón en header cuando está autenticado)
- Ingresar como: `alumno@target.com`
- ✅ Redirige a `/dashboard/alumno`
- Ver: Mi bloque, módulos, recursos, progreso

### 4. **Admin - Gestión Consolidada**
- Logout y prueba: `admin@target.com`
- ✅ Va a `/dashboard/admin`
- Tabs: Profesores, Alumnos, Bloques
- Ver tablas con datos de prueba

### 5. **Marketing - CRUD de Contenido**
- Logout y prueba: `marketing@target.com`
- ✅ Va a `/dashboard/marketing`
- Tabs: Noticias (crear/editar), Viajes, Galería, Sobre Nosotros
- Prueba crear una noticia

### 6. **Protección de Rutas**
- Intenta acceder directamente a `/dashboard/admin` sin estar logueado
- ✅ Debe redirigir a `/login`
- Intenta con `alumno@target.com` acceder a `/dashboard/profesor`
- ✅ Debe redirigir a `/`

---

## 🎨 Estructura de Carpetas Creada

```
src/
├── context/
│   └── AuthContext.jsx           ← Sistema de autenticación mock
├── components/
│   ├── dashboard/
│   │   ├── profesor/
│   │   │   └── DashboardProfesor.jsx
│   │   ├── alumno/
│   │   │   └── DashboardAlumno.jsx
│   │   ├── admin/
│   │   │   └── DashboardAdmin.jsx
│   │   ├── marketing/
│   │   │   └── DashboardMarketing.jsx
│   ├── layout/
│   ├── shared/
│   │   └── RoleGuard.jsx         ← Protección de rutas
│   └── ...
├── pages/
│   ├── Home.jsx, Clases.jsx, etc (públicas)
│   └── Login.jsx                  ← Nueva página
├── services/
│   └── api.js                     ← Skeleton para APIs futuras
├── styles/
│   ├── global.css
│   ├── variables.css
│   └── pages/
│       ├── login.css
│       └── dashboard.css          ← Estilos de dashboards
└── ...
```

---

## 📝 Notas Importantes

1. **Autenticación es MOCK**: Los datos se guardan en `localStorage`
2. **Recarga de página**: Si recargas (F5), la sesión persiste (localStorage)
3. **API**: Los servicios en `services/api.js` están listos para conectar a Vercel Functions
4. **Content.json**: DashboardMarketing usa datos de prueba de `src/data/content.json`
5. **CSS**: Brand colors aplicados (#1F3864 azul, #4E8B6B verde)

---

## ✅ Próximos Pasos (FASE 2)

1. Configurar Docker + PostgreSQL local
2. Definir schema.prisma
3. Crear Vercel Functions en `/api`
4. Conectar frontend a backend real
5. Reemplazar mock AuthContext con Supabase real

¡El frontend está listo! 🎉

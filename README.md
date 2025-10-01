# 🔗 MultiEnlace

**Tu página de enlaces personalizada con analíticas avanzadas**

SaaS similar a Linktree con más opciones de personalización, analíticas completas y planes Free/Pro.

---

## 📚 Stack Tecnológico

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: NestJS 10 + TypeScript + Swagger
- **Base de Datos**: Prisma ORM + PostgreSQL 15
- **Autenticación**: JWT en cookies httpOnly + Secure
- **Testing**: Jest + Playwright
- **Calidad**: ESLint + Prettier + Husky
- **Observabilidad**: Sentry + Pino Logger
- **Despliegue**: Vercel (frontend) + Railway (backend)

---

## 🏗️ Estructura del Proyecto

```
multienlace/
├── apps/
│   ├── web/              # Next.js 15 App Router
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/              # NestJS 10 API
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   └── app.controller.ts
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── config/           # Configuración compartida ESLint
│   └── typescript-config/ # Configuraciones TypeScript
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- PostgreSQL 15

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd multienlace
pnpm install
```

### 2. Configurar variables de entorno

**Frontend (`apps/web/.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=
```

**Backend (`apps/api/.env`):**

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multienlace?schema=public"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cookies
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# CORS
CORS_ORIGIN=http://localhost:3000

# Sentry
SENTRY_DSN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=60
```

### 3. Iniciar en modo desarrollo

```bash
# Todos los servicios
pnpm dev

# Solo frontend
pnpm --filter web dev

# Solo backend
pnpm --filter api dev
```

---

## 📦 Scripts Disponibles

### Raíz del monorepo

```bash
pnpm dev           # Inicia todos los proyectos en desarrollo
pnpm build         # Construye todos los proyectos
pnpm lint          # Ejecuta linter en todos los proyectos
pnpm test          # Ejecuta tests en todos los proyectos
pnpm format        # Formatea todo el código
pnpm format:check  # Verifica formato sin modificar
pnpm clean         # Limpia todos los builds
```

### Frontend (web)

```bash
pnpm --filter web dev      # Servidor desarrollo (http://localhost:3000)
pnpm --filter web build    # Build producción
pnpm --filter web start    # Servidor producción
pnpm --filter web lint     # Linter
```

### Backend (api)

```bash
pnpm --filter api dev          # Servidor desarrollo (http://localhost:3001)
pnpm --filter api build        # Build producción
pnpm --filter api start        # Servidor producción
pnpm --filter api lint         # Linter
pnpm --filter api test         # Tests unitarios
pnpm --filter api test:e2e     # Tests E2E
```

---

## 🔒 Seguridad

- **CORS**: Configurado estrictamente para dominios permitidos
- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: 60 req/min (Free) / 240 req/min (Pro)
- **Validación**: Zod (frontend) + class-validator (backend)
- **JWT**: Cookies httpOnly + Secure + SameSite
- **HTTPS**: Obligatorio en producción

---

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests con coverage
pnpm --filter api test:cov

# Tests E2E
pnpm --filter api test:e2e
```

---

## 📊 Swagger API Documentation

Una vez iniciado el backend, accede a:

👉 **http://localhost:3001/api/docs**

---

## 🎯 Planes Free vs Pro

### 🆓 Plan Gratuito

- ✅ Enlaces ilimitados
- ✅ 1 tema base
- ✅ Analítica simple (clics totales)
- ✅ Retención 30 días
- ❌ Sin dominio propio
- ❌ Sin OG personalizada
- ⚠️ Branding "MultiEnlace" obligatorio
- 🔢 Rate limit: 60 req/min

### 💎 Plan Pro

- ✅ Todo lo del plan Free +
- ✅ Dominios propios (CNAME)
- ✅ OG Image personalizada
- ✅ Analítica avanzada (referrer, país, intervalos)
- ✅ Retención 6-12 meses
- ✅ Temas premium
- ✅ Remover branding
- 🔢 Rate limit: 240 req/min

---

## 🚢 Despliegue

### Frontend (Vercel)

```bash
# Desde la raíz del proyecto
vercel --cwd apps/web
```

### Backend (Railway)

```bash
# Conectar con Railway
railway link

# Desplegar
railway up
```

---

## 📝 Criterios de Aceptación - Sector 1 ✅

### ✅ Estructura del Monorepo

- [x] Configuración Turborepo con `turbo.json`
- [x] Workspace de pnpm con `pnpm-workspace.yaml`
- [x] Aplicación Next.js 15 en `apps/web`
- [x] Aplicación NestJS 10 en `apps/api`
- [x] Paquete de configuración compartida en `packages/config`
- [x] Paquete de configuración TypeScript en `packages/typescript-config`

### ✅ Configuración de Calidad

- [x] ESLint configurado en todos los proyectos
- [x] Prettier configurado globalmente
- [x] Husky con hooks de pre-commit y pre-push
- [x] TypeScript estricto en todo el proyecto

### ✅ Aplicación Web (Next.js)

- [x] Next.js 15 con App Router
- [x] TypeScript configurado
- [x] TailwindCSS instalado y configurado
- [x] Estructura básica de carpetas (app, components, lib)
- [x] Página de inicio funcional
- [x] API client con soporte para cookies

### ✅ Aplicación API (NestJS)

- [x] NestJS 10 configurado
- [x] Swagger/OpenAPI en `/api/docs`
- [x] Helmet para seguridad
- [x] CORS configurado
- [x] Rate limiting con @nestjs/throttler
- [x] Logger estructurado con Pino
- [x] Validación global con class-validator
- [x] Cookie parser configurado
- [x] Health check endpoints

### ✅ Testing

- [x] Jest configurado para tests unitarios
- [x] Test E2E básico configurado

### ✅ Documentación

- [x] README completo con instrucciones
- [x] Variables de entorno documentadas
- [x] Scripts de desarrollo documentados

---

## 🔧 Comandos de Verificación

```bash
# Verificar que todo compila
pnpm run build

# Verificar linting
pnpm run lint

# Verificar formato
pnpm run format:check

# Verificar tests
pnpm run test
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

---

## 📄 Licencia

Privado - Todos los derechos reservados

---

## 👨‍💻 Autor

MultiEnlace Team

---

## 🗺️ Roadmap

- [x] **Sector 1**: Scaffolding del monorepo ✅
- [x] **Sector 2**: Prisma schema + migraciones ✅
- [ ] **Sector 3**: Backend auth + CRUD
- [ ] **Sector 4**: Frontend auth + dashboard básico
- [ ] **Sector 5**: Dashboard avanzado + editor
- [ ] **Sector 6**: Página pública SSR + SEO
- [ ] **Sector 7**: Analytics + tracking
- [ ] **Sector 8**: Seguridad + tests
- [ ] **Sector 9**: Deploy + producción

---

**¡Sector 1 completado! 🎉**

# 🗄️ SECTOR 2 - PRISMA SCHEMA & DATABASE

## 📋 Resumen

Base de datos PostgreSQL con Prisma ORM, modelos completos, migraciones y seeds.

---

## 🏗️ Modelos Creados

### 1. **User** (Usuarios)

- ✅ Autenticación (email/password)
- ✅ Planes: FREE / PRO
- ✅ Feature flags JSON para funcionalidades
- ✅ Integración con Stripe (customerId)
- ✅ Refresh tokens para JWT

### 2. **Profile** (Perfiles públicos)

- ✅ Username único
- ✅ Información pública (bio, avatar)
- ✅ Personalización (tema, CSS custom)
- ✅ SEO (meta tags, OG image)
- ✅ Dominio personalizado (solo Pro)
- ✅ Analytics (view count)

### 3. **Link** (Enlaces)

- ✅ Título, URL, descripción
- ✅ Ordenamiento (position)
- ✅ Visibilidad (isActive)
- ✅ Contador de clicks
- ✅ Relación con Profile

### 4. **ClickEvent** (Analytics)

- ✅ Tracking completo (IP, UA, referer)
- ✅ Geolocalización (país, ciudad)
- ✅ Device detection (dispositivo, browser, OS)
- ✅ UTM parameters
- ✅ Fingerprint para deduplicación
- ✅ Índices optimizados

### 5. **RefreshToken** (JWT Refresh)

- ✅ Tokens de refresco
- ✅ Expiración configurable
- ✅ Cascade delete con User

---

## 🎯 Feature Flags (Planes)

### Plan FREE

```json
{
  "domains": false,
  "advancedAnalytics": false,
  "ogImage": false,
  "removeBranding": false,
  "extraThemes": false
}
```

### Plan PRO

```json
{
  "domains": true,
  "advancedAnalytics": true,
  "ogImage": true,
  "removeBranding": true,
  "extraThemes": true
}
```

---

## 📦 Comandos Principales

### **1. Generar Cliente Prisma**

```bash
cd apps/api
pnpm prisma generate
```

### **2. Crear Migración**

```bash
cd apps/api
pnpm prisma migrate dev --name init
```

### **3. Aplicar Migraciones (Producción)**

```bash
cd apps/api
pnpm prisma migrate deploy
```

### **4. Ejecutar Seeds**

```bash
cd apps/api
pnpm prisma db seed
```

### **5. Abrir Prisma Studio (GUI)**

```bash
cd apps/api
pnpm prisma studio
```

### **6. Reset Database (¡Cuidado!)**

```bash
cd apps/api
pnpm prisma migrate reset
```

---

## 👥 Usuarios de Prueba (Seeds)

### Usuario FREE

- **Email**: `demo@multienlace.com`
- **Password**: `password123`
- **Username**: `@demo`
- **Plan**: FREE
- **Links**: 4 enlaces de ejemplo
- **URL**: http://localhost:3000/@demo

### Usuario PRO

- **Email**: `pro@multienlace.com`
- **Password**: `password123`
- **Username**: `@prouser`
- **Plan**: PRO
- **Links**: 5 enlaces de ejemplo
- **Features**: Todas las funciones Pro habilitadas
- **URL**: http://localhost:3000/@prouser

---

## 🔗 Integración con NestJS

### **PrismaService**

Servicio global que extiende PrismaClient:

- ✅ Conexión automática al inicio
- ✅ Desconexión al cerrar
- ✅ Configuración según ambiente
- ✅ Logs en desarrollo
- ✅ Helper para testing

### **PrismaModule**

Módulo global exportado:

```typescript
import { PrismaService } from './prisma/prisma.service';

// Inyectar en cualquier servicio
constructor(private prisma: PrismaService) {}
```

---

## 📊 Índices Optimizados

### ClickEvent

- `linkId` - Queries por link
- `clickedAt` - Ordenamiento temporal
- `fingerprint` - Deduplicación

### Link

- `profileId` - Queries por perfil
- `position` - Ordenamiento

### Únicos

- `User.email`
- `User.stripeCustomerId`
- `Profile.username`
- `Profile.customDomain`
- `RefreshToken.token`

---

## 🔐 Seguridad

### Passwords

- ✅ Hashing con bcrypt (salt rounds: 10)
- ✅ Nunca se exponen en queries

### Soft Deletes

- ✅ `isActive` en Profile y Link
- ✅ No se borran, se ocultan

### Cascade Deletes

- ✅ User → RefreshToken, Profile
- ✅ Profile → Link
- ✅ Link → ClickEvent

---

## 📈 Analytics

### Métricas Básicas (FREE)

- Clicks totales por link
- Clicks totales del perfil

### Métricas Avanzadas (PRO)

- Clicks por intervalo temporal
- Distribución geográfica
- Dispositivos y browsers
- Referers y UTM tracking
- Tendencias y comparativas

---

## ⚙️ Configuración de Base de Datos

### Desarrollo (Local)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/multienlace?schema=public"
```

### Producción (Railway)

```env
DATABASE_URL="postgresql://user:pass@host:5432/railway?schema=public"
```

### Testing

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/multienlace_test?schema=public"
```

---

## 🚀 Próximos Pasos (Sector 3)

- [ ] Módulo de autenticación (JWT + Cookies)
- [ ] CRUD de Users
- [ ] CRUD de Profiles
- [ ] CRUD de Links
- [ ] Guards para planes Free/Pro
- [ ] Endpoints de analytics
- [ ] Webhooks de Stripe

---

## ✅ Criterios de Aceptación

### Schema

- [x] Modelo User con planes y features
- [x] Modelo Profile con personalización
- [x] Modelo Link con ordenamiento
- [x] Modelo ClickEvent con tracking completo
- [x] Modelo RefreshToken para JWT
- [x] Enum Plan (FREE/PRO)
- [x] Índices optimizados

### Migraciones

- [ ] Migración inicial creada
- [ ] Base de datos sincronizada

### Seeds

- [x] Script de seeds completo
- [x] 2 usuarios de prueba (FREE + PRO)
- [x] Enlaces de ejemplo
- [x] Click events de prueba
- [ ] Seeds ejecutados

### Integración

- [x] PrismaService creado
- [x] PrismaModule exportado
- [x] Integrado en AppModule
- [ ] Cliente Prisma generado

---

## 📝 Notas Importantes

1. **Ejecutar migraciones antes de seeds**
2. **Crear archivo `.env` local** con DATABASE_URL
3. **Tener PostgreSQL corriendo** antes de migrar
4. **Usuario/password** de prueba: `password123`
5. **Prisma Studio** para visualizar datos: `pnpm prisma studio`

---

**Estado**: ✅ Schema completo, pendiente migraciones

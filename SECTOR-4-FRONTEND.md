# 🎨 SECTOR 4 - FRONTEND AUTH + DASHBOARD

## 📋 Resumen

Frontend completo con Next.js 14 (App Router), autenticación con cookies httpOnly, dashboard funcional y componentes UI modernos.

---

## 🏗️ Estructura Creada

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Página de login
│   │   │   └── register/
│   │   │       └── page.tsx     # Página de registro
│   │   ├── (dashboard)/         # Grupo de rutas protegidas
│   │   │   ├── layout.tsx       # Layout con navegación
│   │   │   └── dashboard/
│   │   │       └── page.tsx     # Dashboard principal
│   │   ├── layout.tsx           # Layout raíz con AuthProvider
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                  # Componentes UI reutilizables
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── card.tsx
│   │       └── alert.tsx
│   ├── contexts/
│   │   └── auth-context.tsx     # Context de autenticación global
│   ├── lib/
│   │   ├── axios.ts             # Cliente API con refresh token
│   │   ├── utils.ts             # Utilities (cn)
│   │   └── validations/
│   │       └── auth.ts          # Schemas Zod
│   └── middleware.ts            # Protección de rutas
└── .env.local                   # Variables de entorno
```

---

## ✅ Componentes Implementados

### 1. **API Client (axios.ts)**

Cliente Axios configurado con:

- ✅ Base URL desde `NEXT_PUBLIC_API_URL`
- ✅ `withCredentials: true` para cookies httpOnly
- ✅ Interceptor de refresh token automático en 401
- ✅ Manejo de loops infinitos con flag `isRefreshing`
- ✅ Cola de peticiones pendientes durante refresh
- ✅ Redirección automática a `/login` si refresh falla
- ✅ Tipos TypeScript para User y responses

**Características clave:**

```typescript
// Refresh automático transparente
apiClient.get('/profiles'); // Si 401, refresh automático y retry
```

---

### 2. **AuthContext**

Context global de autenticación con:

- ✅ Estado de usuario (`user`, `loading`)
- ✅ Métodos: `login`, `register`, `logout`, `refreshUser`
- ✅ Carga inicial del usuario con `/auth/me`
- ✅ Redirecciones automáticas post-auth
- ✅ Hook `useAuth()` para consumir en componentes

**Uso:**

```typescript
const { user, loading, login, logout } = useAuth();
```

---

### 3. **Páginas de Autenticación**

#### **Login** (`/login`)

- ✅ Formulario con react-hook-form
- ✅ Validación con Zod schema
- ✅ Mensajes de error claros
- ✅ Loading states
- ✅ Link a registro
- ✅ Diseño moderno con Card

#### **Register** (`/register`)

- ✅ Formulario con email, password, name (opcional)
- ✅ Validación con Zod schema
- ✅ Mensajes de error claros
- ✅ Loading states
- ✅ Link a login
- ✅ Diseño moderno con Card

---

### 4. **Dashboard Layout**

Layout protegido con:

- ✅ Header con logo y navegación
- ✅ Menú: Dashboard, Mis Enlaces, Mi Perfil, Analytics (Pro)
- ✅ User menu con nombre/email y plan
- ✅ Botón de logout
- ✅ Indicador de plan con link a upgrade
- ✅ Loading state mientras carga usuario
- ✅ Redirección automática a `/login` si no autenticado

---

### 5. **Dashboard Principal**

Dashboard con:

- ✅ Saludo personalizado
- ✅ Alert de plan FREE con CTA a upgrade
- ✅ Cards de estadísticas (Enlaces, Clicks, Plan)
- ✅ Acciones rápidas (Agregar enlace, Editar perfil, Ver público)
- ✅ Lista de funciones según plan
- ✅ Indicadores visuales de features (✓ activo, ✕ bloqueado)

---

### 6. **Componentes UI**

Componentes reutilizables con Tailwind + CVA:

#### **Button**

- Variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Tamaños: `default`, `sm`, `lg`, `icon`
- Estados: `disabled`, `loading`

#### **Input**

- Estilos consistentes
- Focus states con ring
- Placeholder y disabled states

#### **Label**

- Asociación con inputs
- Estilos de accesibilidad

#### **Card**

- Componentes: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Diseño moderno con sombras y bordes

#### **Alert**

- Variantes: `default`, `destructive`, `success`, `warning`
- Componentes: `Alert`, `AlertTitle`, `AlertDescription`

---

### 7. **Middleware**

Protección de rutas con:

- ✅ Rutas `/dashboard/*` requieren autenticación
- ✅ Rutas `/login` y `/register` redirigen a `/dashboard` si ya autenticado
- ✅ Redirección con parámetro `?redirect` para volver después de login
- ✅ Verificación de cookies `accessToken` y `refreshToken`
- ✅ Exclusión de rutas estáticas y assets

---

### 8. **Landing Page**

Página inicial con:

- ✅ Hero con título y descripción
- ✅ Botones CTA (Comenzar Gratis, Iniciar Sesión)
- ✅ 3 features destacadas con iconos
- ✅ Diseño responsive con gradientes
- ✅ Redirección automática a `/dashboard` si ya autenticado
- ✅ Loading state durante verificación

---

## 📦 Dependencias Instaladas

```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "zod": "^3.x",
    "react-hook-form": "^7.63.0",
    "@hookform/resolvers": "^5.2.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.544.0"
  }
}
```

---

## 🔐 Flujo de Autenticación

### **Registro**

1. Usuario completa formulario en `/register`
2. Validación Zod del lado cliente
3. POST a `/auth/register` con axios
4. Backend setea cookies httpOnly (`accessToken`, `refreshToken`)
5. AuthContext actualiza estado con usuario
6. Redirección automática a `/dashboard`

### **Login**

1. Usuario completa formulario en `/login`
2. Validación Zod del lado cliente
3. POST a `/auth/login` con axios
4. Backend setea cookies httpOnly
5. AuthContext actualiza estado
6. Redirección a `/dashboard` o `?redirect` si existe

### **Carga Inicial**

1. App monta, AuthContext ejecuta `loadUser()`
2. GET a `/auth/me` con cookies
3. Si 200: usuario cargado
4. Si 401: intenta refresh automático
5. Si refresh OK: retry `/auth/me`
6. Si refresh falla: redirige a `/login`

### **Refresh Token Automático**

1. Cualquier petición recibe 401
2. Interceptor detecta 401 (no en `/auth/refresh`)
3. Si no hay refresh en proceso, ejecuta POST `/auth/refresh`
4. Backend valida `refreshToken` cookie y genera nuevo `accessToken`
5. Cookies actualizadas automáticamente
6. Retry de petición original
7. Si refresh falla (401/403): logout y redirige a `/login`

### **Logout**

1. Usuario clickea "Salir"
2. POST a `/auth/logout`
3. Backend elimina cookies
4. AuthContext limpia estado (`user = null`)
5. Redirección a `/login`

---

## 🎨 Diseño y UX

### **Colores**

- Primario: `blue-600` (CTA, links, focus)
- Destructivo: `red-600` (errores, delete)
- Éxito: `green-600` (confirmaciones)
- Neutral: `gray-*` (textos, fondos)

### **Tipografía**

- Títulos: `font-bold`, `text-3xl` - `text-6xl`
- Cuerpo: `text-sm` - `text-lg`
- Labels: `text-sm font-medium`

### **Espaciado**

- Secciones: `space-y-6` - `space-y-8`
- Cards: `p-6`
- Inputs: `space-y-2` entre label e input

### **Responsive**

- Mobile-first con Tailwind
- Breakpoints: `sm:`, `md:`, `lg:`
- Navegación collapse en mobile (pendiente implementar)

---

## 🚀 Comandos

### **Desarrollo**

```bash
cd apps/web
pnpm run dev
```

**URL**: http://localhost:3000

### **Build**

```bash
cd apps/web
pnpm run build
```

### **Lint**

```bash
cd apps/web
pnpm run lint
```

---

## ⚙️ Variables de Entorno

### **Desarrollo** (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### **Producción** (Vercel)

```env
NEXT_PUBLIC_API_URL=https://api.multienlace.com
```

---

## 🧪 Testing Manual

### **1. Registro**

```bash
# 1. Ir a http://localhost:3000
# 2. Click "Comenzar Gratis"
# 3. Completar formulario
# 4. Verificar redirección a /dashboard
# 5. Verificar datos de usuario en header
```

### **2. Login**

```bash
# 1. Logout
# 2. Ir a /login
# 3. Usar credenciales de prueba:
#    Email: demo@multienlace.com
#    Password: password123
# 4. Verificar redirección a /dashboard
```

### **3. Dashboard**

```bash
# 1. Verificar cards de estadísticas
# 2. Verificar plan FREE alert
# 3. Verificar navegación funcional
# 4. Click en links (aunque no estén implementados)
```

### **4. Protección de Rutas**

```bash
# 1. Logout
# 2. Intentar acceder a /dashboard
# 3. Verificar redirección a /login?redirect=/dashboard
# 4. Login
# 5. Verificar redirección de vuelta a /dashboard
```

### **5. Refresh Token**

```bash
# 1. Login
# 2. En DevTools > Application > Cookies
# 3. Eliminar cookie accessToken
# 4. Hacer cualquier petición (navegar en dashboard)
# 5. Verificar refresh automático
# 6. Verificar nueva cookie accessToken
```

---

## ✅ Criterios de Aceptación

### UI Components

- [x] Button con variantes y tamaños
- [x] Input con estilos y estados
- [x] Label para formularios
- [x] Card con subcomponentes
- [x] Alert con variantes

### Autenticación

- [x] Página de login funcional
- [x] Página de registro funcional
- [x] Formularios con validación Zod
- [x] Mensajes de error claros
- [x] Loading states

### Dashboard

- [x] Layout con navegación
- [x] Header con user menu
- [x] Indicador de plan
- [x] Botón de logout
- [x] Dashboard principal con stats
- [x] Acciones rápidas
- [x] Features según plan

### Seguridad

- [x] Cookies httpOnly (backend)
- [x] Refresh token automático
- [x] Protección de rutas con middleware
- [x] Redirecciones correctas
- [x] Manejo de 401/403

### UX

- [x] Landing page atractiva
- [x] Redirección automática si ya autenticado
- [x] Loading states en todas las peticiones
- [x] Diseño responsive
- [x] Gradientes y sombras modernas

---

## 📝 Próximos Pasos (Sector 5)

- [ ] CRUD de Links en dashboard
- [ ] Drag & drop para reordenar
- [ ] Editor de perfil
- [ ] Preview en vivo
- [ ] Paywalls visuales para features Pro
- [ ] Página pública `/@username`

---

## 🐛 Debugging

### **Error: CORS**

```bash
# Verificar que API esté corriendo en http://localhost:3001
# Verificar CORS en apps/api/src/main.ts
# Debe incluir credentials: true y origin correcto
```

### **Error: 401 en /auth/me**

```bash
# Normal en primera carga si no hay cookies
# Verificar que withCredentials: true esté en axios
# Verificar que backend envíe Set-Cookie headers
```

### **Error: Refresh loop infinito**

```bash
# Verificar flag isRefreshing en axios interceptor
# Verificar que /auth/refresh no sea interceptado
```

### **Error: No redirige a dashboard después de login**

```bash
# Verificar router.push('/dashboard') en AuthContext
# Verificar que no haya errores en consola
```

---

## 🎯 Estado Actual

**✅ Sector 4 COMPLETO**

- ✅ Componentes UI modernos con Tailwind
- ✅ Autenticación completa (login, register, logout)
- ✅ Refresh token automático y transparente
- ✅ Dashboard funcional con navegación
- ✅ Protección de rutas con middleware
- ✅ Landing page con CTA
- ✅ Context de autenticación global
- ✅ Validaciones con Zod
- ✅ Formularios con react-hook-form
- ✅ Diseño responsive y moderno

---

**Listo para Sector 5: Dashboard Avanzado (CRUD Links, Editor Perfil, Preview)** 🚀

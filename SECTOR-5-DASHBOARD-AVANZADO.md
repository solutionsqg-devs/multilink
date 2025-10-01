# 🎨 SECTOR 5 - DASHBOARD AVANZADO + PÁGINA PÚBLICA

## 📋 Resumen

Dashboard completo con CRUD de links drag & drop, editor de perfil con paywalls, página pública SSR y tracking de clicks.

---

## 🏗️ Funcionalidades Implementadas

### 1. **Gestión de Links** (`/dashboard/links`)

- ✅ Lista de links con drag & drop para reordenar
- ✅ Formulario crear/editar link en modal
- ✅ Validación con Zod (título, URL, descripción)
- ✅ Botones editar y eliminar por link
- ✅ Contador de clicks visible
- ✅ Reordenamiento persistente en backend
- ✅ Estados de loading y error
- ✅ Links vacíos con CTA

**Tecnologías:**

- @dnd-kit/core + @dnd-kit/sortable
- react-hook-form + zod
- Dialog modal personalizado

---

### 2. **Editor de Perfil** (`/dashboard/profile`)

- ✅ Crear/Actualizar perfil
- ✅ Información básica (username, displayName, bio, avatar, theme)
- ✅ SEO: Meta title, description, OG image (Pro)
- ✅ Dominio personalizado (Pro)
- ✅ CSS personalizado (Pro)
- ✅ Paywalls visuales con candados
- ✅ Link a perfil público
- ✅ Validación completa con Zod

**Características:**

- Username inmutable después de creación
- Features Pro deshabilitadas con opacidad y candado
- CTAs "Upgrade a Pro" visibles
- Preview link con ícono external link

---

### 3. **Página Pública** (`/@username`)

- ✅ SSR con Next.js App Router
- ✅ ISR (revalidación cada 60s)
- ✅ SEO dinámico (meta title, description, OG tags)
- ✅ Avatar circular con sombra
- ✅ Bio y username
- ✅ Links clicables con tracking
- ✅ Contador de visitas
- ✅ Branding MultiEnlace (removible en Pro)
- ✅ Temas personalizables (default, dark, modern, minimal)
- ✅ CSS personalizado inyectado

**SEO:**

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const profile = await getProfile(params.username);
  return {
    title: profile.metaTitle || `${profile.displayName} - MultiEnlace`,
    description: profile.metaDescription || profile.bio,
    openGraph: { ... },
    twitter: { ... },
  };
}
```

---

### 4. **Tracking de Clicks**

- ✅ Endpoint público `/links/:id/click`
- ✅ Redirect 302 a URL destino
- ✅ Incremento de clickCount
- ✅ Captura de IP, User Agent, Referer
- ✅ Preparado para ClickEvent (TODO)

**Flujo:**

1. Usuario clickea link en página pública
2. Request a `/links/:id/click`
3. Backend incrementa contador
4. Redirect a URL destino

---

## 📂 Estructura de Archivos

```
apps/web/src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── links/
│   │       │   └── page.tsx          # Gestión links con D&D
│   │       └── profile/
│   │           └── page.tsx          # Editor de perfil
│   └── @[username]/
│       └── page.tsx                  # Página pública SSR
├── components/ui/
│   ├── dialog.tsx                    # Modal reutilizable
│   ├── textarea.tsx                  # Textarea estilizado
│   └── select.tsx                    # Select estilizado
└── lib/validations/
    ├── link.ts                       # Schema Zod para links
    └── profile.ts                    # Schema Zod para perfiles

apps/api/src/links/
├── links.controller.ts               # + Endpoint trackClick
└── links.service.ts                  # + Método trackClick
```

---

## 🎨 Componentes UI Nuevos

### **Dialog**

Modal personalizado con backdrop y contexto:

```tsx
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogTrigger>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descripción</DialogDescription>
    </DialogHeader>
    {/* Contenido */}
    <DialogFooter>
      <Button>Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### **Textarea**

Textarea estilizado con ring focus:

```tsx
<Textarea rows={4} placeholder="Texto..." />
```

### **Select**

Select estilizado consistente:

```tsx
<Select>
  <option value="default">Por Defecto</option>
  <option value="dark">Oscuro</option>
</Select>
```

---

## 🔐 Paywalls Implementados

### **Estrategia de Paywalls**

1. **Visual (Soft Paywall)**:
   - Features Pro visibles pero deshabilitadas
   - Opacidad 60% + candado
   - CTA "Upgrade a Pro"

2. **Backend (Hard Paywall)**:
   - Guards verifican `user.features`
   - Validación en service layer
   - Error 403 si intenta usar feature bloqueada

**Ejemplo en Profile:**

```tsx
const isPro = user?.plan === 'PRO';

<Card className={!isPro ? 'opacity-60' : ''}>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      SEO y Meta Tags
      {!isPro && <FiLock size={16} />}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Input {...register('metaTitle')} disabled={!isPro} />
  </CardContent>
</Card>;
```

---

## 🎯 Drag & Drop Implementation

### **Configuración dnd-kit**

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = links.findIndex(l => l.id === active.id);
    const newIndex = links.findIndex(l => l.id === over.id);
    const newLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(newLinks);

    // Persistir en backend
    await apiClient.patch('/links/reorder', {
      linkIds: newLinks.map(l => l.id),
    });
  }
}
```

---

## 📊 Validaciones

### **Link Schema**

```typescript
export const linkSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(100),
  url: z
    .string()
    .min(1, 'URL requerida')
    .regex(/^https?:\/\/.+/, 'Debe comenzar con http:// o https://')
    .url('URL inválida'),
  description: z.string().max(200).optional(),
  icon: z.string().max(100).optional(),
});
```

### **Profile Schema**

```typescript
export const profileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones'),
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  theme: z.enum(['default', 'dark', 'modern', 'minimal']),
  customCss: z.string().max(5000).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  customDomain: z.string().optional().or(z.literal('')),
});
```

---

## 🚀 Flujos de Usuario

### **Flujo: Crear Perfil**

1. Usuario va a `/dashboard/profile`
2. Si no tiene perfil, formulario vacío
3. Llena información básica (username único)
4. Submit → POST `/profiles`
5. Éxito: perfil creado, link visible
6. Features Pro deshabilitadas (paywalls)

### **Flujo: Gestionar Links**

1. Usuario va a `/dashboard/links`
2. Ve lista de links ordenados
3. Puede:
   - Crear nuevo (modal)
   - Editar existente (modal)
   - Eliminar (confirmación)
   - Reordenar (drag & drop)
4. Cambios persisten automáticamente

### **Flujo: Visita Pública**

1. Visitante va a `/@username`
2. SSR renderiza perfil con Next.js
3. Metadata SEO inyectada
4. Links clicables
5. Click → Redirect via `/links/:id/click`
6. Contador incrementa

---

## 🎨 Temas Disponibles

### **Default**

```css
bg-white
```

### **Dark**

```css
bg-gray-900 text-white
```

### **Modern**

```css
bg-gradient-to-br from-purple-50 to-blue-50
```

### **Minimal**

```css
bg-gray-50
```

---

## 📦 Dependencias Agregadas

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "react-icons": "^5.5.0"
}
```

---

## ✅ Criterios de Aceptación

### Links Management

- [x] Página `/dashboard/links` funcional
- [x] CRUD completo (Create, Read, Update, Delete)
- [x] Drag & drop para reordenar
- [x] Formulario con validación Zod
- [x] Modal para crear/editar
- [x] Contador de clicks visible
- [x] Persistencia en backend

### Profile Editor

- [x] Página `/dashboard/profile` funcional
- [x] Crear perfil (username inmutable)
- [x] Actualizar perfil
- [x] Información básica editable
- [x] Features Pro con paywalls
- [x] Link a perfil público
- [x] Validación completa

### Página Pública

- [x] Ruta `/@username` con SSR
- [x] ISR (revalidación 60s)
- [x] SEO dinámico completo
- [x] Avatar, bio, username
- [x] Links clicables
- [x] Tracking de clicks
- [x] Temas aplicados
- [x] CSS personalizado
- [x] Branding condicional

### Paywalls

- [x] Features Pro visualmente bloqueadas
- [x] Candados y opacidad en UI
- [x] CTAs "Upgrade a Pro"
- [x] Backend valida permisos
- [x] Error 403 si intenta usar feature

---

## 🧪 Testing

### **Manual Testing**

1. **Crear Perfil:**

```bash
# 1. Login con demo@multienlace.com
# 2. Ir a /dashboard/profile
# 3. Llenar formulario (username: testuser)
# 4. Submit
# 5. Verificar link "Ver Perfil Público" aparece
# 6. Verificar features Pro deshabilitadas
```

2. **Gestionar Links:**

```bash
# 1. Ir a /dashboard/links
# 2. Crear nuevo link (título: GitHub, url: https://github.com)
# 3. Verificar aparece en lista
# 4. Arrastrar para reordenar
# 5. Editar link (cambiar título)
# 6. Eliminar link
```

3. **Página Pública:**

```bash
# 1. Ir a /@testuser (o /@demo si usaste seeds)
# 2. Verificar metadata en DevTools > Elements > <head>
# 3. Verificar avatar, bio, links
# 4. Click en link
# 5. Verificar redirect
# 6. Volver y verificar contador incrementó
```

4. **Paywalls:**

```bash
# 1. Login con usuario FREE
# 2. Ir a /dashboard/profile
# 3. Intentar editar "Meta Title" (disabled)
# 4. Verificar opacidad y candado
# 5. Click "Upgrade a Pro"
```

---

## 🐛 Issues Conocidos

1. **Next.js Params async**: En Next.js 15, `params` es async, por eso usamos:

   ```tsx
   const { username } = await params;
   ```

2. **ISR y Cache**: El `revalidate: 60` puede no funcionar en desarrollo. En producción usa `next build && next start`.

3. **CSS Personalizado**: Validar y sanitizar CSS en producción para evitar XSS.

---

## 🚀 Próximos Pasos (Sector 6)

- [ ] Analytics dashboard (gráficos con recharts)
- [ ] Exportar datos (CSV/JSON)
- [ ] Búsqueda y filtros de links
- [ ] Templates de perfiles
- [ ] Preview en vivo al editar

---

## 📝 Notas Técnicas

### **ISR Configuration**

```typescript
// En página pública
fetch(url, {
  next: { revalidate: 60 }, // Revalidar cada 60s
});
```

### **Metadata Generation**

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const profile = await getProfile(params.username);
  return {
    title: profile.metaTitle || default,
    description: profile.metaDescription || default,
    openGraph: { ... },
  };
}
```

### **Drag & Drop Performance**

- Usa `CSS.Transform.toString()` para mejor performance
- `closestCenter` collision detection
- Keyboard support para accesibilidad

---

**Estado**: ✅ Sector 5 COMPLETO

- ✅ CRUD Links con drag & drop
- ✅ Editor de perfil con paywalls
- ✅ Página pública SSR con SEO
- ✅ Tracking de clicks
- ✅ Validaciones Zod completas
- ✅ Componentes UI reutilizables

---

**Listo para Sector 6: Analytics + Features Avanzadas** 📊

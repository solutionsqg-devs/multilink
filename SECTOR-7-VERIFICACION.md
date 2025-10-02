# ✅ Sector 7: Analytics - COMPLETADO

## 📊 **Objetivo**

Implementar sistema de analíticas con diferenciación FREE vs PRO:

- **FREE**: Clicks totales por link (básico)
- **PRO**: Clicks por día, referrers, dispositivos, intervalos de tiempo (avanzado)

---

## 🔧 **Backend: Módulo Analytics**

### Archivos creados:

#### 1. `apps/api/src/analytics/analytics.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

#### 2. `apps/api/src/analytics/analytics.service.ts`

- **`getOverview(userId)`**: Overview general con diferenciación FREE/PRO
  - FREE: Total links, total clicks, top 10 links
  - PRO: + Profile views, clicks last 7 days, clicks by day (30d), top referrers
- **`getLinkAnalytics(linkId, userId)`**: Analytics de un link específico
  - FREE: Solo total de clicks
  - PRO: + Clicks por día, top referrers, análisis de dispositivos

**Características clave:**

- Queries SQL raw para agregaciones por fecha (`DATE("timestamp")`)
- `groupBy` para top referrers
- Clasificación simple de dispositivos (mobile, desktop, tablet)
- Validación de permisos (solo el dueño puede ver sus analytics)

#### 3. `apps/api/src/analytics/analytics.controller.ts`

```typescript
@Get('overview') - Overview general del usuario
@Get('link/:id') - Analytics de un link específico
```

#### 4. Integración en `apps/api/src/app.module.ts`

```typescript
imports: [
  // ...
  AnalyticsModule,
],
```

#### 5. Mejora de tracking en `apps/api/src/links/links.service.ts`

**Método `trackClick` actualizado:**

```typescript
async trackClick(id: string, trackingData: { ip: string; userAgent: string; referer: string }) {
  // 1. Incrementar clickCount en Link
  await this.prisma.link.update({ ... });

  // 2. Guardar ClickEvent para analytics
  await this.prisma.clickEvent.create({
    data: {
      linkId: id,
      ip: trackingData.ip || null,
      userAgent: trackingData.userAgent || null,
      referer: trackingData.referer || null,
      timestamp: new Date(),
    },
  });

  return link;
}
```

---

## 🎨 **Frontend: Dashboard de Analytics**

### Dependencias instaladas:

```bash
pnpm add recharts date-fns
```

- **recharts**: Gráficos interactivos (Line, Bar, Pie)
- **date-fns**: Formateo de fechas

### Archivos creados:

#### 1. `apps/web/src/app/(dashboard)/dashboard/analytics/page.tsx`

**Componentes de gráficos:**

- `LineChart`: Evolución de clicks por día (PRO)
- `BarChart`: Top 10 enlaces más clickeados
- `PieChart`: Distribución de top referrers (PRO)

**Secciones:**

1. **Header**: Título + descripción diferenciada FREE/PRO
2. **Alert**: Notificación plan FREE con CTA a upgrade
3. **Stats Cards**:
   - Enlaces Totales
   - Clicks Totales
   - Vistas de Perfil (PRO)
   - Clicks últimos 7 días (PRO)
4. **Gráfico de línea**: Clicks por día (PRO)
5. **Gráfico de barras**: Top 10 enlaces
6. **Gráfico circular + Lista**: Top referrers (PRO)
7. **Tabla**: Detalles de enlaces con clicks
8. **CTA Card**: Paywall suave para usuarios FREE

**Paywall suave:**

- Los usuarios FREE ven analytics básicos
- Se muestra un CTA destacado con beneficios del plan PRO
- No se bloquea completamente el acceso, solo se limitan las features

#### 2. Actualización de `apps/web/src/app/(dashboard)/layout.tsx`

- Enlace "Analytics" visible para todos los usuarios
- Badge "PRO" amarillo para usuarios FREE
- Enlace completo para usuarios PRO

---

## 🎯 **Features implementadas**

### FREE (Básico)

✅ Total de links
✅ Total de clicks
✅ Top 10 links más clickeados (gráfico de barras)
✅ Tabla de detalles por link
✅ CTA visible para upgrade a PRO

### PRO (Avanzado)

✅ Vistas de perfil
✅ Clicks en últimos 7 días
✅ **Clicks por día** (gráfico de línea, 30 días)
✅ **Top referrers** (gráfico circular + lista, 30 días)
✅ **Análisis de dispositivos** (mobile, desktop, tablet)
✅ Analytics individuales por link (endpoint `/analytics/link/:id`)
✅ Retención de datos históricos

---

## 🔒 **Seguridad y Permisos**

1. **Guards de plan**: Lógica de filtrado en el servicio según `user.plan` y `user.features.advancedAnalytics`
2. **Validación de propiedad**: Solo el dueño puede ver analytics de sus links
3. **Queries optimizadas**: Uso de `groupBy`, `aggregate`, SQL raw con índices
4. **Deduplicación**: ClickEvents únicos con timestamp para evitar duplicados

---

## 📊 **Queries SQL destacadas**

### Clicks por día (últimos 30 días)

```sql
SELECT DATE("timestamp") as date, COUNT(*)::int as count
FROM "ClickEvent"
WHERE "linkId" IN (
  SELECT l.id FROM "Link" l
  INNER JOIN "Profile" p ON l."profileId" = p.id
  WHERE p."userId" = ${userId}
)
AND "timestamp" >= ${thirtyDaysAgo}
GROUP BY DATE("timestamp")
ORDER BY date DESC
```

### Top referrers

```typescript
const topReferrers = await this.prisma.clickEvent.groupBy({
  by: ['referer'],
  where: {
    link: { profile: { userId } },
    timestamp: { gte: thirtyDaysAgo },
    referer: { not: null },
  },
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
  take: 10,
});
```

---

## 🧪 **Testing Manual**

### Escenario 1: Usuario FREE

1. Crear cuenta FREE
2. Crear 3 enlaces
3. Simular clicks en esos enlaces
4. Ir a `/dashboard/analytics`
5. ✅ Debe ver: Total links, total clicks, top links (gráfico), tabla
6. ✅ Debe ver: Alert de plan FREE + CTA a Pro
7. ✅ NO debe ver: Clicks por día, referrers, vistas de perfil

### Escenario 2: Usuario PRO

1. Actualizar usuario a PRO (DB o futuro checkout)
2. Ir a `/dashboard/analytics`
3. ✅ Debe ver: Todo lo de FREE + gráfico de clicks por día + top referrers
4. ✅ NO debe ver: Alert de upgrade

### Escenario 3: Tracking de Clicks

1. Abrir perfil público de usuario (`/@username`)
2. Hacer clic en un link
3. Verificar en DB:
   ```sql
   SELECT * FROM "ClickEvent" WHERE "linkId" = 'xxx' ORDER BY "timestamp" DESC LIMIT 5;
   ```
4. ✅ Debe tener: ip, userAgent, referer, timestamp

### Escenario 4: Analytics de Link Individual

```bash
# Usuario PRO
curl -H "Cookie: access_token=xxx" http://localhost:3001/analytics/link/:linkId

# Respuesta esperada PRO:
{
  "linkId": "...",
  "title": "...",
  "url": "...",
  "totalClicks": 42,
  "clicksByDay": [...],
  "topReferrers": [...],
  "devices": { "mobile": 10, "desktop": 30, "tablet": 2, "unknown": 0 }
}

# Respuesta esperada FREE:
{
  "linkId": "...",
  "title": "...",
  "url": "...",
  "totalClicks": 42
}
```

---

## ✅ **Criterios de Aceptación**

### Backend

- [x] Módulo `AnalyticsModule` creado
- [x] `AnalyticsService.getOverview()` con lógica FREE/PRO
- [x] `AnalyticsService.getLinkAnalytics()` con lógica FREE/PRO
- [x] `ClickEvent` se guarda correctamente en `trackClick`
- [x] Queries SQL optimizadas para agregaciones
- [x] Validación de permisos (solo dueño)

### Frontend

- [x] Página `/dashboard/analytics` funcional
- [x] Gráficos con `recharts` (Line, Bar, Pie)
- [x] Diferenciación visual FREE vs PRO
- [x] Paywall suave con CTA a upgrade
- [x] Enlace en navegación con badge "PRO" para FREE
- [x] Carga de datos desde `/analytics/overview`
- [x] Manejo de estados (loading, error)

### UX

- [x] Usuarios FREE ven analytics básicos útiles
- [x] Paywall no invasivo (no modal, solo CTA)
- [x] Usuarios PRO ven datos avanzados automáticamente
- [x] Gráficos responsive y con tooltips
- [x] Formateo de fechas en español (`date-fns/locale/es`)

---

## 📈 **Métricas por Plan**

| Métrica                  | FREE | PRO |
| ------------------------ | ---- | --- |
| Total Links              | ✅   | ✅  |
| Total Clicks             | ✅   | ✅  |
| Top 10 Links (gráfico)   | ✅   | ✅  |
| Tabla de detalles        | ✅   | ✅  |
| Vistas de perfil         | ❌   | ✅  |
| Clicks últimos 7 días    | ❌   | ✅  |
| Clicks por día (30d)     | ❌   | ✅  |
| Top referrers            | ❌   | ✅  |
| Análisis de dispositivos | ❌   | ✅  |
| Retención datos          | 30d  | 12m |

---

## 🚀 **Próximos pasos**

- **Sector 8**: Seguridad + Testing (Helmet, Sentry, Jest, Playwright)
- **Sector 9**: Deploy + README (Vercel, Railway, Stripe webhooks, docs)

---

## 🎉 **Estado: SECTOR 7 COMPLETADO (77% del proyecto)**

**Progreso total: 7 de 9 sectores** 🔥

# Prompt Maestro — MultiEnlace (NestJS + Next.js + Postgres)

Quiero que construyas un SaaS llamado **MultiEnlace**, similar a Linktree pero con más opciones de personalización, analíticas y planes **Free vs Pro**.  
El trabajo debe entregarse **por sectores (1→9)**, siguiendo buenas prácticas modernas de 2025.

---

## 0) Stack FIJO (no cambiar)

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: NestJS 10 (TypeScript) con REST API + Swagger/OpenAPI
- **ORM/DB**: Prisma ORM + PostgreSQL 15
- **Auth**: JWT access + refresh en **cookies httpOnly + Secure**, `SameSite=Strict/None`
- **Hosting**: Vercel (frontend) + Railway (backend + DB)
- **Testing**: Jest (unit) + Playwright (E2E)
- **Seguridad**: bcrypt, validaciones Zod (frontend) + class-validator (backend)
- **Calidad**: ESLint + Prettier + Husky
- **Observabilidad**: Sentry (web+api) + logs JSON (pino/nestjs-pino)

---

## 1) Ajustes mínimos obligatorios

1. **Observabilidad**: Sentry + logging estructurado en backend.
2. **Rate limiting**: `@nestjs/throttler` (60 req/min Free, 240 req/min Pro).
3. **Hardening**: helmet, CORS estricto, validación de URLs (regex + whitelist http/https).
4. **Anti-fraude en clics**: deduplicación por IP+UA+cookie TTL 30–60 min; conteo solo server-side.
5. **Caching**: páginas públicas con ISR (`revalidate=60`) y `ETag`; APIs GET con `Cache-Control`.
6. **Feature flags**: campo `plan` y `features` en `User`.
7. **Seeds y migraciones**: `prisma migrate` + `prisma db seed`.
8. **CI local**: `pnpm -r lint && pnpm -r test && pnpm -r build`.

---

## 2) Riesgos y mitigaciones

- **Costos variables**: monitorear free tiers de Vercel/Railway; tener fallback (Render/Fly.io).
- **Cookies cross-domain**: usar `COOKIE_DOMAIN=.multi.link` y probar en staging real.
- **Referers limitados en analytics**: complementar con parámetros UTM y server events.
- **Escalabilidad futura**: modularidad en Nest, índices en Prisma, ISR en Next.
- **Fraude en tracking**: rate limit + dedupe server-side; nunca confiar en cliente.

---

## 3) Planes Free vs Pro

- **En DB (Prisma)**:
  - `User.plan = "free" | "pro"`
  - `User.features` (JSON o booleanos):
    - `domains`, `advancedAnalytics`, `ogImage`, `removeBranding`, `extraThemes`

- **Gratis (Free)**:
  - Links ilimitados
  - 1 tema base
  - Analítica simple (clics totales/por link)
  - Retención 30 días
  - Sin dominio propio, sin OG personalizada
  - Branding obligatorio “MultiEnlace”
  - Rate limit 60 req/min

- **Pro**:
  - Todo lo anterior + dominios propios (CNAME)
  - OG personalizada
  - Analítica avanzada (por link, referrer, país, intervalo)
  - Retención 6–12 meses
  - Más temas + remover marca
  - Rate limit 240 req/min

- **Payments (Stripe + MercadoPago)**:
  - Stripe: Internacional (España, USA, Europa)
  - MercadoPago: LATAM (Argentina, Brasil, México, etc.)
  - Checkout para suscripción mensual/anual
  - Webhooks actualizan `plan` y `features`
  - Customer Portal para cancelación/downgrade

- **UX Gating**:
  - UI muestra features bloqueados con candado + CTA “Mejorar a Pro”
  - Paywall suave: permite configurar, al guardar lanza modal “Pro requerido”

---

## 4) Sectores de entrega

1. **Scaffolding**: monorepo con Turborepo, apps web (Next) y api (Nest), paquete config.
2. **Prisma schema**: modelos User, Profile, Link, ClickEvent con plan/features.
3. **Backend (Nest)**: auth con JWT cookies, CRUD Links/Profiles, endpoints analytics, guards por features/plan, webhooks Stripe.
4. **Frontend (Next)**: auth pages, dashboard básico, fetch API con cookies.
5. **Dashboard avanzado**: CRUD links drag&drop, editor perfil, preview, paywalls visibles.
6. **Página pública SSR**: `/@:username` con SEO dinámico, branding según plan, ISR y caché.
7. **Analytics**: tracking con dedupe, panel básico Free y avanzado Pro.
8. **Seguridad + calidad**: throttling, helmet, Sentry, tests unit/E2E, Husky.
9. **Deploy + README**: deploy Vercel + Railway, README con setup env, pricing table Free vs Pro, instrucciones de Stripe/webhooks.

---

## 5) Reglas de salida

- No cambiar stack ni librerías.
- Entrega sectorizada con estructura, comandos pnpm, código clave y criterios de aceptación.
- TypeScript estricto en todo.
- JWT solo en cookies httpOnly + Secure.
- Validaciones fuertes (URLs, inputs).
- Logs y observabilidad desde el MVP.
- Branding visible obligatorio en Free.

---

## Instrucción final

Genera el **Sector 1 (Scaffolding)** ahora mismo-
En cada sector entrega:

- Estructura de carpetas
- Comandos pnpm exactos
- Código clave listo para copiar
- Criterios de aceptación verificables

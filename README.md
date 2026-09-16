# Agendia

Agenda y administra tus citas y servicios. SPA para profesionales independientes (peluqueros, entrenadores, terapeutas, etc.): gestionan clientes, servicios y citas, y reciben reservas a través de una página pública personalizable.

## Funcionalidades

- **Autenticación** completa (login, registro, recuperación y reset de contraseña, confirmación por email) con errores traducidos a español.
- **Onboarding** en 2 pasos (perfil del negocio + primer servicio) con generación automática de slug público.
- **Citas**: creación con cliente/servicio, flujo de estados (pendiente → confirmada → completada / cancelada), reagendado y seguimiento (recordatorios de citas completadas sin follow-up).
- **Calendario** mensual con contadores por día y detalle de citas del día.
- **Clientes y servicios** con soft-delete (desactivación) y reactivación desde el filtro de inactivos.
- **Ganancias** (earnings) e indicadores del mes.
- **Página pública** `/p/[slug]` con branding del negocio (logo, color) — accesible sin cuenta, para compartir y reservar.
- **Ajustes**: perfil del negocio (nombre, slug, logo, color de marca), apariencia (tema de color), preferencias personales (formato de hora) y cuenta/seguridad (cambio de contraseña, borrado de cuenta).
- **PWA** instalable con auto-update, detección offline y estados de error diferenciados.

## Stack

- [Nuxt 4](https://nuxt.com) (SPA, `ssr: false`) + [Vue 3](https://vuejs.org)
- [@nuxt/ui](https://ui.nuxt.com) v4 (componentes + Tailwind CSS v4)
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) vía `@nuxtjs/supabase`
- [@tanstack/vue-query](https://tanstack.com/query) para cache de datos
- [Zod](https://zod.dev) para schemas de formularios
- [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app) y [Sentry](https://sentry.io) (opcional)

## Requisitos

- Node.js 20+ y [pnpm](https://pnpm.io)
- Un proyecto de Supabase (las tablas se crean con las migrations de `supabase/migrations/`)

## Puesta en marcha

```bash
pnpm install          # corre `nuxi prepare` automáticamente
cp .env.example .env  # completar con las credenciales del proyecto Supabase
pnpm gen-types        # regenera app/types/database.types.ts (project-id en package.json)
pnpm dev              # http://localhost:3000
```

Variables de entorno (ver `.env.example`):

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NUXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NUXT_PUBLIC_SUPABASE_KEY` | Sí | Anon key (pública por diseño; RLS protege los datos) |
| `NUXT_PUBLIC_SENTRY_DSN` | No | DSN de Sentry para tracking de errores |

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm preview` / `pnpm generate` | Build de producción |
| `pnpm typecheck` | Única verificación del repo (no hay lint ni tests) |
| `pnpm gen-types` | Regenera tipos de la DB desde Supabase |

## Estructura

```
app/
  pages/            # landing, auth, onboarding, /p/[slug] (pública), workspace/*
  components/       # por dominio: Appointment, Client, Service, Calendar, Business, Settings...
  composables/      # por dominio: queries/, mutations/, utils/, storage/
  schemas/          # validación Zod de formularios
  types/            # database.types.ts (generado) + wrappers de dominio
  middleware/       # auth, onboarding (fail-closed), guest
supabase/
  migrations/       # fuente de verdad del schema de la DB
  README.md         # infra: migrations, Edge Function delete-account, dev local
docs/               # PLAN_PRODUCTO.md, PLAN_CORRECCIONES.md (registro histórico)
```

La guía completa de arquitectura y convenciones está en [AGENTS.md](./AGENTS.md).

## Notas clave

- **RLS**: cada fila pertenece a un profesional (`professional_id = auth.uid()`); ningún usuario ve datos de otro. La página pública lee vía datos exentos controlados.
- **Seguridad de datos**: borrar la cuenta elimina todos sus datos (FK `ON DELETE CASCADE`); la Edge Function `delete-account` se gestiona desde el dashboard de Supabase (contrato en `supabase/README.md`).
- **Locale y moneda**: `es-MX` / `MXN` definidos en `nuxt.config.ts` (sin sistema i18n).
- **Cache**: invalidación por queryKey raíz en las mutaciones — los cambios se reflejan en todas las vistas relacionadas.

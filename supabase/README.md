# Supabase — notas de infraestructura

## Migrations — prefijos únicos (2026-09-15)

Los archivos con prefijos duplicados (`2× 20260820_*`, `5× 20260902_*`) fueron
renombrados a timestamps completos y únicos para que el CLI no los colapse
como una sola versión:

| Antes                       | Ahora                             |
| --------------------------- | --------------------------------- |
| `20260820_user_assets_bucket.sql` | `20260820100000_user_assets_bucket.sql` |
| `20260820_user_preferences.sql`   | `20260820100100_user_preferences.sql` |
| `20260902_business_profiles.sql`  | `20260902100000_business_profiles.sql` |
| `20260902_business_profiles_brand_color.sql` | `20260902100100_business_profiles_brand_color.sql` |
| `20260902_business_profiles_category.sql`   | `20260902100200_business_profiles_category.sql` |
| `20260902_is_slug_available.sql`            | `20260902100300_is_slug_available.sql` |
| `20260902_services_public_read.sql`         | `20260902100400_services_public_read.sql` |

`20260901_core_tables.sql` y `20260914_core_hardening.sql` ya eran únicos (no
cambiaron).

### Historial remoto — repair completado (2026-09-15)

Ejecutado con el CLI (`npx supabase login` + `migration repair`): versiones
viejas `20260820`/`20260902` marcadas como revertidas, las 7 renombradas más
`20260901` y `20260914` (aplicadas originalmente vía SQL editor/recuperación
de prod) marcadas como aplicadas. `npx supabase migration list --linked`
muestra Local = Remote en las 9 migrations — `db push`/`db pull` son seguros.

Comandos de referencia, por si se repite un desync del historial:

```bash
npx supabase migration repair --linked --status reverted 20260820 20260902
npx supabase migration repair --linked --status applied \
  20260820100000 20260820100100 20260902100000 20260902100100 \
  20260902100200 20260902100300 20260902100400
npx supabase migration list --linked   # verificar Local = Remote
```

## Dev local (Docker) — opcional

`supabase start` / `db reset` local requieren Docker Desktop (no instalado en
esta máquina al 2026-09-15). Habilitaría verificar el replay de todas las
migrations en un entorno fresco. No es requerido para lanzar.

## Edge Function `delete-account` — gestión actual

La Edge Function `delete-account` (borrado de cuenta desde Settings → Cuenta y
seguridad) **NO vive en este repo**: se crea y gestiona desde el dashboard de
Supabase (Edge Functions → delete-account).

### Contrato con el cliente (fuente: `app/composables/User/mutations/useDeleteAccount.ts`)

- **Endpoint**: `POST {SUPABASE_URL}/functions/v1/delete-account`
- **Headers**: `Authorization: Bearer <access_token de la sesión>`, `apikey: <anon key>`, `Content-Type: application/json`
- **Body**: `{ "password": string }` — la función revalida la contraseña antes de borrar
- **Respuesta**: `{ success: true }` o `{ error: string }` con status no-OK

### Consideraciones de seguridad

- **"Verify JWT" está DESACTIVADO** en la configuración de la función (dashboard). El JWT se valida **manualmente dentro del código de la función**, junto con la verificación de contraseña. No reactivar la verificación automática sin revisar el código de la función primero.
- El borrado real de datos lo hace la FK `professional_id`/`user_id → auth.users ON DELETE CASCADE`: al borrar el usuario de `auth.users`, caen sus filas de `business_profiles`, `clients`, `services` y `appointments`.
- El logo de Storage (`business_profiles.logo_path`) debe borrarse dentro de la función antes/después del CASCADE (verificar en el código del dashboard).

### Si se quiere mover al repo (pendiente opcional)

1. Copiar el código desde el dashboard a `supabase/functions/delete-account/index.ts`.
2. Desplegar con `supabase functions deploy delete-account` (requiere `supabase login` o `SUPABASE_ACCESS_TOKEN`).
3. Mantener "Verify JWT" desactivado en `config.toml` (`[functions.delete-account] verify_jwt = false`) o reactivarlo y simplificar la validación manual.

Mientras viva solo en el dashboard: **cualquier cambio a la función debe hacerse ahí y documentarse en este archivo.**

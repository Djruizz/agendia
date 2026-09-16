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

## Allowlist de registro (2026-09-15)

`20260915100000_allowed_emails.sql` gatea el signup a nivel DB:

- Trigger `BEFORE INSERT` en `auth.users` (`trg_signup_allowlist` → `public.assert_signup_allowed()`, SECURITY DEFINER): rechaza con `AGENDIA_SIGNUP_NOT_ALLOWED` (errcode 28000) cualquier email que no esté en `public.allowed_emails` (comparación case-insensitive). Fail-closed.
- Trigger `AFTER INSERT` (`trg_signup_allowlist_audit` → `public.mark_signup_consumed()`): marca la invitación como consumida (`user_id`, `registered_at`) — auditoría de qué invitaciones se usaron.
- `allowed_emails` tiene RLS habilitado **sin policies**: solo postgres / service role la tocan.
- Los emails ya registrados al momento del deploy fueron sembrados con `added_by = 'seed'` (pueden re-registrarse si borran su cuenta). Usuarios existentes: cero impacto (el login no pasa por INSERT).

### Dar / quitar permiso (manual, SQL editor)

```sql
-- Invitar
insert into public.allowed_emails (email) values ('correo@ejemplo.com');

-- Revocar (solo previene registros futuros; no afecta cuentas existentes)
delete from public.allowed_emails where email = 'correo@ejemplo.com';

-- Ver invitaciones y su uso
select email, added_by, invited_at, registered_at, user_id
from public.allowed_emails order by invited_at desc;
```

### Consideraciones

- El trigger bloquea **todos** los inserts en `auth.users`, incluyendo los del service role (dashboard "Add user" / `auth.admin.createUser`). El flujo post-compra futuro debe insertar primero en `allowed_emails (added_by = 'purchase')` y después crear el usuario — el orden importa.
- El error del trigger puede llegar al cliente como mensaje custom o como el genérico `Database error saving new user` (GoTrue suele tragar el detalle); `describeAuthError` (app/utils/authErrors.ts) mapea ambos patrones a `signup-not-allowed`.
- Registro abierto (lanzamiento público): dropear `trg_signup_allowlist` (y opcionalmente `trg_signup_allowlist_audit` + la tabla). El mapeo de error en `authErrors.ts` puede quedarse inofensivo.

## Email de confirmación — template con token_hash (2026-09-15)

### Por qué

El flujo anterior (`{{ .ConfirmationURL }}` → `/auth/confirm?code=...` → `exchangeCodeForSession`) usa PKCE: el `code` solo puede canjearse en el navegador que registró (el `code_verifier` vive en su localStorage). Abrir el link en otro dispositivo confirma el email en DB pero no loguea → vista "No se pudo confirmar".

### Template actual (dashboard: Auth → Email Templates → "Confirm signup")

El HTML completo con el estilo de la app vive en
`supabase/templates/confirm-signup.html` (paleta pink/zinc alineada a la app,
email-safe: tablas + estilos inline). Pegar su contenido en el campo "Message"
(sin el bloque de comentarios inicial) y usar el Subject sugerido en el
mismo archivo. La parte crítica es el `href` del botón:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirmar tu correo</a>
```

`{{ .SiteURL }}` es el Site URL configurado en el dashboard (prod). Para probar el flujo completo en dev local, ajustarlo temporalmente o probar directo contra prod.

### Contrato con el cliente (`app/pages/auth/confirm.vue`)

- `?token_hash=...` → `verifyOtp({ token_hash, type: "signup" })` — verifica y loguea en cualquier dispositivo (devuelve sesión donde se abre el link).
- `?code=...` (legacy, emails enviados antes del cambio de template) → `exchangeCodeForSession` — solo funciona en el mismo navegador del registro.
- Sin params → fallback a sesión existente.

### Recovery de contraseña — token_hash (2026-09-15)

Mismo patrón aplicado al flujo de restablecer contraseña (limitación cross-device resuelta):

- **Template "Reset Password"** (dashboard: Auth → Email Templates): HTML completo con el estilo de la app en `supabase/templates/reset-password.html`. El `href` crítico:
  ```html
  <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Restablecer contraseña</a>
  ```
- **Cliente** (`app/pages/reset-password.vue`): `?token_hash=...` → `verifyOtp({ token_hash, type: "recovery" })` (establece sesión en cualquier dispositivo) → después el form llama `updateUser({ password })`. Vista de carga mientras verifica y vista de error con CTA a `/forgot-password` si el enlace expiró/ya fue usado.
- Sin `token_hash` (legacy `?code=` del template default): el cliente de supabase-js auto-canjea el code al cargar — solo funciona en el mismo navegador del `resetPasswordForEmail`.

### Cambio de email — token_hash (2026-09-15)

Disparado desde Settings → Cuenta y seguridad (`SettingsAccountSecurity.vue` → `updateUser({ email })`). El email llega al correo **nuevo**:

- **Template "Change Email Address"** (dashboard: Auth → Email Templates): HTML completo en `supabase/templates/change-email.html` (usa `{{ .Email }}` = actual y `{{ .NewEmail }}` = nuevo). El `href` crítico:
  ```html
  <a href="{{ .SiteURL }}/auth/change-email?token_hash={{ .TokenHash }}&type=email_change">Confirmar nuevo correo</a>
  ```
- **Cliente** (`app/pages/auth/change-email.vue`): `verifyOtp({ token_hash, type: "email_change" })` → confirma el cambio y refresca la sesión → redirect a `/workspace`. **Sin middleware `guest`** (a diferencia de `/auth/confirm`): el caso común es mismo navegador con sesión activa, y `guest` redirigiría a `/workspace` antes de verificar el token.
- **Supuesto**: "Double confirm email change" (Auth → Settings) desactivado (default) — solo el correo nuevo recibe enlace. Si se activa, revisar el flujo.
- **Nota allowlist**: `allowed_emails` queda con el email VIEJO tras un cambio. Solo importa si la cuenta se borra y la persona quiere re-registrarse con el email nuevo — requeriría invitarlo de nuevo.

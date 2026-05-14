# Beat App

Sistema interno de gestión para **Producciones Beat**.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage)
- **FullCalendar** para vista de calendario
- Deploy: Vercel

## Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar `.env.local` con tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   SUPABASE_SECRET_KEY=sb_secret_xxx
   ```

3. Correr la migración SQL en Supabase:
   - Abrir Supabase Dashboard → SQL Editor → New query
   - Pegar el contenido de `supabase/migrations/0001_initial.sql`
   - Run

4. Levantar dev server:
   ```bash
   npm run dev
   ```

5. Abrir http://localhost:3000

## Estructura

```
app/
  (auth)/login/         Magic link login
  auth/callback/        OAuth/magic-link callback
  dashboard/            App protegida por auth
    page.tsx            Home (calendario + listados)
    proyectos/
    clientes/
    cotizaciones/
    proveedores/
    reuniones/
components/
  calendario-proyectos.tsx
lib/
  supabase/             Clients (browser, server, middleware)
  utils.ts              Helpers (cn, formatCurrency, formatDate)
middleware.ts           Auth gate
supabase/migrations/    Schema SQL
```

## Auth

- Magic link vía Supabase Auth.
- Cada usuario en `auth.users` genera automáticamente un `profile` (trigger en SQL).
- Roles: `admin` (Paolo) y `editor` (resto del equipo).

## Identidad visual

- Amarillo: `#FFB600`
- Negro: `#131615`
- Gris claro: `#E3E3E3`
- Tipografía: Kanit (títulos) + Poppins (cuerpo).

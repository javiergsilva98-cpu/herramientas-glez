# Herramientas Glez

App personal (Next.js + Supabase, desplegada en Vercel) que reúne pequeñas
herramientas del día a día. Cada herramienta vive en su propia ruta y tiene
su propio icono/nombre para poder añadirla a la pantalla de inicio del
iPhone como si fuera una app independiente.

## Herramientas

| Herramienta | Ruta | Estado |
|---|---|---|
| 🛒 Lista de la compra | `/lista-compra` | ✅ funcional |
| ✅ Lista de tareas | `/tareas` | 🚧 próximamente |
| 🧳 Maleta | `/maleta` | 🚧 próximamente |
| 🌱 Tareas del huerto | `/huerto` | 🚧 próximamente |
| 💶 Divisor de gastos | `/gastos` | 🚧 próximamente |

## Puesta en marcha

### 1. Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor** y ejecuta las migraciones
   de la carpeta [`migraciones/`](./migraciones) **en orden** (001, 002...).
   El estado de cuáles se han ejecutado ya se lleva en
   [`migraciones/ESTADO.md`](./migraciones/ESTADO.md).
2. Ve a **Authentication → Providers → Email** y asegúrate de que el login
   por enlace mágico (magic link / OTP) está activado.
3. Ve a **Authentication → Settings** y desactiva **"Allow new users to
   sign up"** (o similar) para que solo puedan entrar las personas que tú
   invites manualmente desde **Authentication → Users → Invite user**
   (tú, y quien quieras que use estas herramientas contigo).
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

### 2. Vercel

1. Importa este repositorio en Vercel (ya lo tienes vinculado). Al haber
   `package.json` con Next.js en la raíz, Vercel lo detectará
   automáticamente en el próximo deploy.
2. En **Project Settings → Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key de Supabase
3. Vuelve a desplegar (Redeploy) para que las variables se apliquen.
4. En Supabase, en **Authentication → URL Configuration**, añade la URL de
   tu deploy de Vercel (y `http://localhost:3000` si vas a probar en local)
   a **Redirect URLs**, para que el enlace mágico funcione correctamente.

### 3. Desarrollo local

```bash
cp .env.example .env.local   # y rellena las dos variables
npm install
npm run dev
```

## Añadir una herramienta nueva a la pantalla de inicio del iPhone

Cada herramienta tiene su propio manifest (`public/manifests/<tool>.webmanifest`)
e iconos (`public/icons/<tool>/icon-*.png`), definidos en
`app/<tool>/layout.tsx`. Para diferenciarlas en el iPhone:

1. Abre la ruta de la herramienta en Safari (ej. `tuapp.vercel.app/lista-compra`).
2. Compartir → **Añadir a pantalla de inicio**.
3. iOS usará el icono y nombre propios de esa herramienta.

Los iconos actuales son placeholders de color sólido generados
automáticamente; sustitúyelos en `public/icons/<tool>/` por las imágenes
que quieras usar (mantén los tamaños 180×180, 192×192 y 512×512).

## Añadir una herramienta nueva al proyecto

1. Añade su entrada en [`lib/tools.ts`](./lib/tools.ts) (nombre, emoji,
   color, ruta, `ready: false` hasta que esté lista).
2. Crea `app/<slug>/layout.tsx` (metadata + manifest propio, copia uno
   existente como plantilla) y `app/<slug>/page.tsx`.
3. Genera su manifest en `public/manifests/<slug>.webmanifest` y sus
   iconos en `public/icons/<slug>/`.
4. Si necesita datos propios, añade una nueva migración numerada en
   `migraciones/` (ver [convención de migraciones](./migraciones/ESTADO.md))
   y ejecútala en el SQL Editor de Supabase cuando toque.

# Luna Oficio

Herramientas para trabajar con archivos **sin subirlos a ningún servidor**: unir y comprimir PDF, comprimir imagen, HEIC a JPG, JPG a WebP, firmar PDF y documentos de trabajo en PDF (presupuestos, avisos de cobro, partes de horas, gastos). Cada página resuelve una búsqueda concreta y está pensada para encontrarse en Google. Pro añade WebP en lote, un plugin de WordPress y la marca de agua.

Las herramientas piden **iniciar sesión**. Hay dos modos, y la web elige solo según haya o no variables de Supabase:

- **Modo nube (recomendado):** con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, las cuentas viven en Supabase (Postgres en la UE). Valen en cualquier aparato, hay «recuperar contraseña», Stripe activa Pro solo y el panel `/admin` ve todos los registros. Ver [Supabase](#supabase-cuentas-pro-y-panel-con-base-de-datos).
- **Modo local (sin variables):** la cuenta se guarda en este navegador (`localStorage`, PBKDF2). No hay base de datos: si cambias de teléfono, hay que crearla otra vez.

En los dos modos, **los PDF, fotos y presupuestos no se suben a ningún sitio**: se procesan en el navegador.

En el **teléfono**: barra inferior (Inicio, PDF, Fotos, Documentos), botones grandes, recorte que no mueve la página, y al guardar se abre el menú de compartir (Guardar en Archivos).

## Herramientas

- **Versiones de un trabajo** (`/versiones`): un cliente, un encargo, varios presupuestos (básico / recomendado / completo, con o sin urgencia).
- **Recordatorios de cobro** (`/cobros`): pegas quién te debe y copias o abres WhatsApp / correo.
- **Presupuestos en lote** (`/presupuestos`): varios presupuestos de una vez, listos para PDF y mensaje.
- **Parte de horas** (`/horas`): pegas la semana y sacas un papel para el cliente o el jefe.
- **Relación de gastos** (`/gastos`): pegas los tickets y sale base + IVA para el gestor.
- **Rellenar y firmar PDF** (`/pdf`): subes el PDF (modelo 145 u otro), marcas casillas, escribes, firmas y descargas. El archivo no se sube a ningún servidor.
- **Unir / dividir / comprimir PDF** (`/unir-pdf`, `/dividir-pdf`, `/comprimir-pdf`): las búsquedas gordas. En el navegador.
- **JPG a PDF** y **PDF a JPG** (`/jpg-a-pdf`, `/pdf-a-jpg`): fotos ↔ hojas.
- **Rotar, numerar y eliminar páginas PDF** (`/rotar-pdf`, `/numerar-pdf`, `/eliminar-paginas-pdf`).
- **Marca de agua PDF** (`/marca-de-agua-pdf`): Pro.
- **Imagen** (`/herramientas-imagen`): comprimir, PNG/JPG/WebP, HEIC a JPG, recortar, girar, redimensionar.
- **WebP en lote** (`/webp-en-lote`): Pro. Hasta 300 imágenes o una carpeta entera a WebP, con calidad y ancho máximo, en un zip con los mismos nombres. Todo en el navegador (`src/components/webp-batch-tool.tsx`).
- **Plugin WordPress WebP** (`/plugin-wordpress-webp`): Pro. Descarga de `luna-oficio-webp.zip`; ver [Plugin de WordPress](#plugin-de-wordpress-webp).
- **Audio a WAV** y **recortar audio** (`/audio-a-wav`, `/recortar-audio`). No hay MP3 de salida ni vídeo.

Blog (`/blog`), FAQ (`/faq`), precios (`/precios`), comparativas objetivas (`/comparar`, `alternativa-a-…`) y páginas legales (`/aviso-legal`, `/privacidad`, `/cookies`, `/condiciones`). Consentimiento de cookies en el pie; puedes cambiarlo en `/cookies`.

Paleta: negro `#12110f`, naranja `#ff4b1a`, amarillo `#ffe14a`, hueso `#f4f0e6`. Sin azul. El logo es un cuadrado negro, luna naranja y chispa amarilla.

Las landings `alternativa-a-{marca}` citan marcas ajenas con publicidad comparativa (Ley 3/1991 art. 10, Ley 17/2001, STS 105/2016): no usamos su logo ni su nombre como si fuéramos ellos. El producto se llama Luna Oficio.

Aparcado: PDF a Word, vídeo, quitar fondo, ampliar con IA.

La tienda de plantillas (`/tienda`) sigue en el código, pero ya no está en el menú: el producto son las herramientas.

## Dinero (sin servidor)

- **Gratis:** unir, comprimir, firmar, imagen, oficio. Anuncios de casa si aceptas publicidad (AdSense cuando haya ID de cliente).
- **Pro (29 €/año):** sin anuncios, marca de agua en PDF, WebP en lote y plugin de WordPress. Pago con **Stripe** (Payment Link) o **Revolut**. Pega los enlaces en `src/lib/payments.ts` o en Hostinger:

  `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`  
  `NEXT_PUBLIC_REVOLUT_PAYMENT_LINK`

  En Stripe, pon la URL de éxito a `/precios/?pago=ok`. Tras pagar, el usuario activa la clave en este navegador.

Los PDF y la cuenta **no salen** de este navegador.

## Panel de administración (`/admin`)

Sin servidor, el panel vive en **tu** navegador (contraseña propia, PBKDF2). Desde ahí:

- **Socios Pro:** apuntas cada pago (Stripe, Revolut, Bizum…), se firma una clave única `LUNA-SERIAL-YYYYMMDD-firma` con ECDSA P-256 y la mandas por correo. Renovar, revocar, reembolso, notas, buscar, CSV.
- **Cuentas:** las cuentas gratuitas creadas en ese aparato (borrar, nueva contraseña). Las de otros teléfonos no existen en ningún servidor: no se pueden listar.
- **Claves:** crear la clave de firma privada (copia descargable), ver la pública, comprobar una clave que te manda un socio, lista de revocados.
- **Ajustes:** copia de seguridad JSON (con o sin clave privada), restaurar, estado de Stripe/Revolut/AdSense, Pro y cookies de ese navegador, zona roja.
- **Resumen:** socios al día, caducan en 30 días, cobrado, checklist del negocio, pendientes.

Para que la web acepte tus claves firmadas: `/admin` → Claves → copiar clave pública → Hostinger, variable `NEXT_PUBLIC_PRO_PUBLIC_KEY` → Redistribuir. Hasta entonces la web solo acepta la clave maestra de pruebas `LUNA-OFICIO-PRO`. Revocaciones: `NEXT_PUBLIC_PRO_REVOKED=SERIAL1,SERIAL2`.

Descarga la copia del panel cada vez que des un alta: si borras datos del navegador, se pierde el libro.

Con Supabase configurado, `/admin` cambia a **modo nube**: entras con tu cuenta normal (el correo de `admin_allowlist` es administrador automáticamente) y ves registros reales, socios, cobros de Stripe, notas compartidas y ajustes. La pestaña Claves sigue ahí como plan B para regalar Pro a alguien sin cuenta.

## Supabase: cuentas, Pro y panel con base de datos

Todo lo que necesita Supabase está en la carpeta `supabase/` y se despliega desde este repositorio:

| Ruta | Qué es |
| --- | --- |
| `supabase/migrations/*.sql` | Esquema: `profiles`, `memberships` (cobros), `admin_notes`, `admin_allowlist`, RLS, triggers y RPC del panel |
| `supabase/functions/stripe-webhook/` | Edge Function: recibe el pago de Stripe y activa Pro |
| `supabase/config.toml` | Config de la CLI (auth, redirects, `verify_jwt=false` para el webhook) |
| `.github/workflows/supabase.yml` | Despliega migraciones y funciones en cada push a `main` si hay secretos |

### 1. Crear el proyecto

Supabase → **New project** (región **EU**, plan Free). Anota: **Project URL**, **anon key** (Project Settings → API), **Project ref** (la parte `xxxx` de `xxxx.supabase.co`) y la **contraseña de la base de datos**.

En **Authentication → URL Configuration**: Site URL `https://lunaoficio.com`, Redirect URLs `https://lunaoficio.com/cuenta/` y `https://lunaoficio.com/entrar/`. En **Authentication → Providers → Email** decide si quieres «Confirm email» (más seguro; el usuario confirma por correo antes de entrar).

### 2. Conectar GitHub (dos formas, vale cualquiera)

- **Integración de Supabase con GitHub** (Project Settings → Integrations → GitHub): elige este repo, directorio `supabase`, rama `main`. Cada push aplica las migraciones y despliega las funciones.
- **GitHub Actions** (ya incluido): en GitHub → Settings → Secrets and variables → Actions añade `SUPABASE_ACCESS_TOKEN` (supabase.com/dashboard/account/tokens), `SUPABASE_PROJECT_ID` (el ref) y `SUPABASE_DB_PASSWORD`. El flujo `Supabase · migraciones y funciones` hace `db push` y `functions deploy`.

Sin ninguna de las dos, también vale pegar el contenido de `supabase/migrations/*.sql` en el **SQL Editor** de Supabase y desplegar la función con la CLI (`supabase functions deploy stripe-webhook`).

### 3. Stripe automático

1. Stripe → Developers → Webhooks → **Add endpoint**: `https://<ref>.supabase.co/functions/v1/stripe-webhook`. Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`. Copia el **signing secret** (`whsec_…`).
2. Supabase → Edge Functions → **Secrets**: `STRIPE_SECRET_KEY` (`sk_live_…`) y `STRIPE_WEBHOOK_SECRET` (`whsec_…`). Opcional `PRO_MONTHS` (12).
3. En el Payment Link de Stripe, redirige tras el pago a `https://lunaoficio.com/precios/?pago=ok`.

La web abre el Payment Link con `prefilled_email` y `client_reference_id` (id de la cuenta), así el webhook enlaza el cobro con el usuario aunque pague con otro correo. Si el comprador no tiene cuenta, el cobro queda «sin cuenta» y se activa solo cuando se registre con ese correo.

### 4. Hostinger

En el sitio de Hostinger, variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_REVOLUT_PAYMENT_LINK=https://checkout.revolut.com/pay/...
```

Redistribuir. Sin las dos primeras, la web sigue funcionando en modo local.

### Qué guarda la base de datos

Solo correo, nombre, fecha de alta, último acceso y los cobros (método, importe, periodo). **Ningún archivo**. Por el RGPD: región UE, aviso de privacidad actualizado y el DPA de Supabase aceptado en el dashboard.

El orden de trabajo está en [`PLAN.md`](PLAN.md): un paso, se prueba en Hostinger, luego el siguiente.

## Cómo correrla en local

```bash
npm install
npm run dev
```

Abre [http://localhost:43147](http://localhost:43147).

Para ver exactamente lo que irá a Hostinger:

```bash
npm run build
npm run start
```

Eso genera la carpeta `out/` (HTML/CSS/JS estáticos) y la sirve en el puerto 43147.

## Subirla a Hostinger (plan React)

El plan **React** de Hostinger no ejecuta un servidor Node (`next start`). Sirve archivos estáticos. Esta web ya está configurada para eso: `npm run build` deja todo en `out/`.

Hostinger construye **GitHub `main`** (`airelaweb-afk/profit-shop`), no el Git de Cursor. Cada `git push` a `main` en GitHub vuelve a publicar.

### Configuración que ya entra (hPanel)

Sitio: `lunaoficio.com` (plan React; el temporal `lightyellow-sheep-110919.hostingersite.com` debe redirigir al dominio propio).

| Campo | Valor |
| --- | --- |
| Framework preset | React (no Next.js si eso pone `.next`) |
| Branch | `main` |
| Node.js | 20, 22 o 24 (`engines`: `>=20`) |
| Root directory | `./` |
| Build command | `npm run build` |
| Package manager | `npm` |
| Output directory | `out` |
| Entry file | vacío |

El `build` del repo ya hace `next build --webpack` (en Hostinger Turbopack se cae al compilar el CSS). No hace falta poner `--webpack` en hPanel.

Si Hostinger detecta Next.js y pone `out` como `.next` o rellena un entry file, cámbialo. Si dejas `.next`, la web sale en blanco.

Si el build de Next termina bien pero Hostinger dice «No output directory found», pulsa **Redistribuir**. No vuelvas a ignorar `out/` en `.gitignore`.

### Opción B — subir `out/` a mano

En tu ordenador:

```bash
npm install
npm run build
```

Sube **el contenido** de `out/` (incluido `.htaccess`) a `public_html` del dominio, por File Manager o FTP. No subas la carpeta `out` entera como subcarpeta: los archivos tienen que quedar en la raíz del sitio.

## Si el plan es Node.js (no React)

Ahí sí podrías correr Next con servidor. Este repo, tal como está, **no** usa ese modo: está exportado a estático para el plan React. No hace falta cambiar nada si ya te funciona con `out/`.

## Plugin de WordPress (WebP)

El código PHP vive en `wordpress-plugin/luna-oficio-webp/` (GPL v2+). `scripts/build-wp-plugin.mjs` lo empaqueta en `public/downloads/luna-oficio-webp.zip` antes de cada `dev`/`build` (la carpeta `public/downloads/` está en `.gitignore`; el zip se genera en Hostinger al construir). La landing `/plugin-wordpress-webp` muestra el botón de descarga solo a cuentas Pro.

Qué hace el plugin (Medios → WebP):

- Convierte a WebP cada JPG/PNG que se sube (original + todas las miniaturas) con el editor de imágenes de WordPress (GD o Imagick).
- Conversor por lotes de la biblioteca existente vía admin-ajax, con progreso, registro y «continúa donde lo dejó».
- Actualiza `_wp_attached_file`, los metadatos, el `post_mime_type` y las URL dentro de `post_content` y `postmeta` (serializado y JSON con barras escapadas).
- Conserva los originales por defecto y permite «Restaurar originales» (todo o por adjunto, desde la lista de Medios).
- Si el WebP pesa más que el original, deja la imagen como está.

Para probarlo en local hace falta un WordPress real: `php -l` sobre los archivos comprueba la sintaxis, y con WP-CLI puedes activar el plugin (`wp plugin activate luna-oficio-webp`) y lanzar la conversión con `Luna_WebP_Converter::convert()`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 43147 |
| `npm run build` | Genera `out/` para Hostinger |
| `npm run start` | Sirve `out/` en el puerto 43147 |
| `npm run lint` | ESLint |
| `npm run build:plugin` | Solo empaqueta el plugin de WordPress en `public/downloads/` |

## Stack

Next.js (export estático), TypeScript, Tailwind CSS y componentes de shadcn/ui.

# Luna Oficio

Herramientas de administración para **autónomos, secretaría y empresas pequeñas**. No es un CRM: cada página resuelve un trabajo pesado (presupuestos, cobros, horas, gastos, firmar PDF) y se puede encontrar en Google.

Las herramientas piden **iniciar sesión**. La cuenta se guarda en este navegador (`localStorage`, contraseña con PBKDF2). No hay base de datos ni servidor propio: si cambias de ordenador, hay que crear la cuenta otra vez. Los PDF no se suben a ningún sitio.

## Herramientas

- **Versiones de un trabajo** (`/versiones`): un cliente, un encargo, varios presupuestos (básico / recomendado / completo, con o sin urgencia).
- **Recordatorios de cobro** (`/cobros`): pegas quién te debe y copias o abres WhatsApp / correo.
- **Presupuestos en lote** (`/presupuestos`): varios presupuestos de una vez, listos para PDF y mensaje.
- **Parte de horas** (`/horas`): pegas la semana y sacas un papel para el cliente o el jefe.
- **Relación de gastos** (`/gastos`): pegas los tickets y sale base + IVA para el gestor.
- **Rellenar y firmar PDF** (`/pdf`): subes el PDF (modelo 145 u otro), marcas casillas, escribes, firmas y descargas. El archivo no se sube a ningún servidor.
- **Unir / dividir / comprimir PDF** (`/unir-pdf`, `/dividir-pdf`, `/comprimir-pdf`): las búsquedas gordas. En el navegador.
- **JPG a PDF** y **PDF a JPG** (`/jpg-a-pdf`, `/pdf-a-jpg`): fotos ↔ hojas.
- **Imagen** (`/herramientas-imagen`): comprimir, PNG/JPG/WebP, HEIC a JPG, recortar, girar, redimensionar.
- **Audio a WAV** y **recortar audio** (`/audio-a-wav`, `/recortar-audio`). No hay MP3 de salida ni vídeo.

Aparcado: PDF a Word, vídeo, quitar fondo, ampliar con IA.

La tienda de plantillas (`/tienda`) sigue en el código, pero ya no está en el menú: el producto son las herramientas.

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

### Opción A — GitHub (recomendada)

Necesitas el código en un repositorio de GitHub. Si todavía no lo tienes, créalo desde Cursor (el botón de crear repo) y después:

1. En hPanel: **Websites → Add website → Node.js Web App**.
2. **Import Git repository** y conecta GitHub.
3. Elige este repo y la rama `main`.
4. Revisa (y corrige si hace falta) estos campos:

| Campo | Valor |
| --- | --- |
| Application type | `next` (o React, si te lo ofrece así el plan) |
| Node.js | 20 o 22 |
| Build script | `build` |
| Output directory | `out` |
| Entry file | vacío |

Si Hostinger detecta Next.js y pone `out` como `.next` o rellena un entry file, cámbialo: con el plan React tiene que quedar **`out`** y **sin** entry file. Si dejas `.next`, la web sale en blanco o falla al arrancar.

Si el build de Next termina bien pero Hostinger dice «No output directory found», pulsa **Redistribuir** (la carpeta `out/` ya no está en `.gitignore`). Si sigue fallando, cambia el preajuste del marco de Next.js a **React** y deja el directorio de salida en `out`.

5. Pulsa **Deploy**. Cada `git push` a `main` vuelve a publicar.

### Opción B — subir `out/` a mano

En tu ordenador:

```bash
npm install
npm run build
```

Sube **el contenido** de `out/` (incluido `.htaccess`) a `public_html` del dominio, por File Manager o FTP. No subas la carpeta `out` entera como subcarpeta: los archivos tienen que quedar en la raíz del sitio.

## Si el plan es Node.js (no React)

Ahí sí podrías correr Next con servidor. Este repo, tal como está, **no** usa ese modo: está exportado a estático para el plan React. No hace falta cambiar nada si ya te funciona con `out/`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 43147 |
| `npm run build` | Genera `out/` para Hostinger |
| `npm run start` | Sirve `out/` en el puerto 43147 |
| `npm run lint` | ESLint |

## Stack

Next.js (export estático), TypeScript, Tailwind CSS y componentes de shadcn/ui.

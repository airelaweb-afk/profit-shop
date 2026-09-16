# Luna Oficio

Herramientas de administración para **autónomos y empresas pequeñas**. No es un CRM: cada página resuelve un trabajo pesado (por ejemplo, generar muchos presupuestos de una vez) y se puede encontrar en Google.

Los datos se quedan en el navegador (`localStorage`). No hay cuentas, ni base de datos, ni servidor propio.

## Herramientas

- **Versiones de un trabajo** (`/versiones`): un cliente, un encargo, varios presupuestos (básico / recomendado / completo, con o sin urgencia).
- **Recordatorios de cobro** (`/cobros`): pegas quién te debe y copias una tanda de mensajes de WhatsApp o correo.
- **Presupuestos en lote** (`/presupuestos`): varios presupuestos de una vez, listos para copiar.

La tienda de plantillas (`/tienda`) sigue disponible como extra.

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

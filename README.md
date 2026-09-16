# Luna Oficio

Herramientas de administración para **autónomos y empresas pequeñas**. No es un CRM: cada página resuelve un trabajo pesado (por ejemplo, generar muchos presupuestos de una vez) y se puede encontrar en Google.

## Herramienta lista

**Tanda de presupuestos** (`/presupuestos`): pegas una lista de clientes, defines tus servicios una vez e imprimes o guardas cada presupuesto en PDF.

**Recordatorios de cobro** (`/cobros`): pegas quién te debe y copias una tanda de mensajes de WhatsApp o correo (primera, segunda o última ronda).

La tienda de plantillas (`/tienda`) sigue disponible como extra.

## Cómo correrla en local

```bash
npm install
npm run dev
```

Abre [http://localhost:43147](http://localhost:43147). En producción: `npm run build && npm run start`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 43147 |
| `npm run build` | Compila para producción |
| `npm run start` | Sirve la build |
| `npm run lint` | ESLint |

## Stack

Next.js, TypeScript, Tailwind CSS y componentes de shadcn/ui.

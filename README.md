# Luna Atelier

Tienda de **productos digitales** (planners, plantillas, kits) pensada para vender por internet sin inventario ni envíos. Incluye catálogo, carrito, checkout de demostración y descarga inmediata del archivo.

## Por qué este proyecto

Vender descargas es uno de los caminos más realistas para facturar en línea: el archivo se produce una vez y cada venta extra casi no cuesta nada. Esta web es el mostrador. Tú sustituyes los productos de ejemplo por los tuyos y, cuando quieras cobrar de verdad, conectas Stripe, Lemon Squeezy o Mercado Pago.

## Cómo correrla en local

```bash
npm install
npm run dev
```

Abre [http://localhost:43147](http://localhost:43147).

- **Tienda:** `/tienda`
- **Checkout demo:** no pide tarjeta; el pedido se guarda en este navegador
- **Descargas:** archivos de texto con el contenido de cada kit

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 43147 |
| `npm run build` | Compila para producción |
| `npm run start` | Sirve la build |
| `npm run lint` | ESLint |

## Stack

Next.js, TypeScript, Tailwind CSS y componentes de shadcn/ui.

# Plan Luna Oficio

Negocio: herramientas de un solo trabajo para autónomos y para quien lleva la administración. Se encuentran solas en Google. No es un CRM. Ahora no hace falta facturar: primero que sirvan de verdad. Más adelante ads o extras de pago. Los datos siguen en el navegador.

## Por qué puede ser rentable

La gente no busca “software de gestión”. Busca el atasco del martes: *hacer varios presupuestos*, *mandar básico y premium*, *recordatorio de cobro*, *parte de horas de la semana*. Quien llega, usa la página gratis. Si la herramienta no produce un papel o un mensaje que se pueda enviar, no hay posicionamiento que valga.

## Cómo vamos a trabajar

Una herramienta. Se publica. Se prueba en el móvil y en el ordenador. Si no sirve para una persona de administración de verdad, se corrige antes de inventar otra.

Cuenta en el navegador (no hay servidor de usuarios). Sin recoger datos fuera de este aparato.

## Pasos

### Paso 1 — Probar sin líos

Hecho: tienda fuera del menú, Versiones en blanco con ejemplo.

### Paso 2 — Presupuestos que se puedan enviar

Hecho en lo básico: logo, cabecera, IVA, numeración, PDF, mensaje, WhatsApp y correo. Seguir puliendo si al probar el PDF no convence.

**Prueba:** `/presupuestos` → logo + tus datos + 2 clientes → ¿se lo mandarías?

### Paso 3 — Cobros que se mandan de un toque

WhatsApp (`wa.me`), correo, copiar. Primera / segunda / última ronda. Importes a la española (450, 1.200, 280 €). Teléfono o correo opcionales en la lista.

**Prueba:** un recordatorio real (o a un amigo). ¿Da vergüenza enviarlo?

### Paso 4 — Parte de horas

Hecho el primero: pegar la semana, ver el total, PDF. No es un fichaje.

**Prueba:** `/horas` → 4 líneas reales de esta semana → ¿se lo enviarías al cliente o al jefe?

### Paso 5 — Gastos para el gestor

Hecho el primero: pegar tickets, separar base e IVA, PDF.

**Prueba:** `/gastos` → 5 tickets reales del mes → ¿se lo enviarías al gestor?

### Paso 6 — Rellenar y firmar PDF

Hecho: hay que entrar con cuenta. Subes el PDF, amplías, marcas casillas (✓/X), escribes, firmas y descargas. Modelos planos tipo 145 van con marcas encima, no con campos AcroForm.

**Prueba:** `/entrar` → cuenta → `/pdf` → un modelo 145 → casillas + descarga.

### Paso 7 — Unir, comprimir y foto ↔ PDF

Hecho: `/unir-pdf`, `/dividir-pdf`, `/comprimir-pdf`, `/jpg-a-pdf`, `/pdf-a-jpg`.

**Prueba:** cuenta → unir dos PDF → descargar.

### Pendiente — PDF a Word

Aparcado a propósito. iLovePDF y Smallpdf sí lo hacen, pero **suben el archivo a un servidor** y corren un motor de maquetación (OCR, tablas, fuentes). En el navegador solo podríamos volcar texto a un .docx flojo. Cuando haya servidor o una API de pago (y se avise que el PDF viaja), se monta. No hay URL a medias.

### Paso 8 — Pulir y la siguiente que duela

Lo que falle en PDF o en el móvil, se corrige. Siguiente atasco concreto (albarán, aplazamientos), no un panel de “todo”.

### Paso 9 — Que Google las encuentre

Una URL, un título, un problema. Textos para búsquedas reales.

### Paso 10 — Ofrecer algo, más adelante

Cuando 1–3 herramientas ya se usen: un extra opcional, o ads. Gratis sigue existiendo. No hay demo calls. No recoger datos de la gente hasta que haya consentimiento claro.

## Qué no hacemos ahora

Cuentas en un servidor (las de ahora viven en el navegador). Pasarela de pago. CRM. La tienda de plantillas. Campañas. Recoger listados de clientes en un servidor. PDF a Word (hasta tener motor decente). Conversiones de vídeo pesadas (ffmpeg.wasm) y quitar fondo / ampliar con IA.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Versiones | `/versiones` |
| Cobros | `/cobros` |
| Presupuestos en lote | `/presupuestos` |
| Parte de horas | `/horas` |
| Gastos | `/gastos` |
| Firmar PDF | `/pdf` |
| Unir PDF | `/unir-pdf` |
| Dividir PDF | `/dividir-pdf` |
| Comprimir PDF | `/comprimir-pdf` |
| JPG a PDF | `/jpg-a-pdf` |
| PDF a JPG | `/pdf-a-jpg` |
| Hub PDF | `/herramientas-pdf` |
| Entrar | `/entrar` |
| Explicación | `/como-funciona` |

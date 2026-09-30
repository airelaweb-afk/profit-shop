(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6978],{209:(e,a,r)=>{"use strict";r.d(a,{default:()=>i});var n=r(2115);let o=(...e)=>e.filter((e,a,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===a).join(" ").trim(),s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"},t=(0,n.createContext)({}),i=(0,n.forwardRef)(({color:e,size:a,width:r,height:i,strokeWidth:d,absoluteStrokeWidth:l,nonScalingStroke:c,className:u="",children:_,iconNode:p=[],icon:m={node:p,aliases:[],size:24},...g},f)=>{let{size:x=24,strokeWidth:h=2,absoluteStrokeWidth:v=!1,nonScalingStroke:b=!1,color:y="currentColor",className:E=""}=(0,n.useContext)(t)??{},S=!!_||(e=>{for(let a in e)if(a.startsWith("aria-")||"role"===a||"title"===a)return!0;return!1})(g),[k,P,N=[]]=function(e,a={}){return function(e,a={}){let r=a.attributeNames??{},n=e=>r[e]??e,t=e.size??e.width??s.width,i=e.size??e.height??s.height,d=e.aliases?.filter(e=>"string"==typeof e&&""!==e.trim()).map(e=>`lucide-${e}`)??[],l=[...e.name?[`lucide-${e.name}`]:[],...d],c=a.className?.split(" ").filter(Boolean)??[],u=!1===a.includeDefaultClasses?o(...c):o("lucide",...l,...c),_=a.absoluteStrokeWidth?Number(a.strokeWidth??s["stroke-width"])*Number(e.size??e.width??s.width)/Number(a.size??a.width??s.width):a.strokeWidth??s["stroke-width"];return["svg",{...Object.entries(s).reduce((e,[a,r])=>(e[n(a)]=r,e),{}),..."color"in a&&a.color&&{[n("stroke")]:a.color},..."size"in a&&null!=a.size&&{[n("width")]:a.size,[n("height")]:a.size},..."width"in a&&null!=a.width&&{[n("width")]:a.width},..."height"in a&&null!=a.height&&{[n("height")]:a.height},[n("stroke-width")]:_,...u&&{[n("class")]:u},[n("viewBox")]:`0 0 ${t} ${i}`,...!1===a.hasA11yProp?{[n("aria-hidden")]:"true"}:{},..."attributes"in a&&a.attributes},e.node.map(e=>{let[r,o,s]=e,t=a.nonScalingStroke?{[n("vector-effect")]:"non-scaling-stroke",...o}:o;return s?[r,t,s]:[r,t]})]}(e,{...a,attributeNames:{...a.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}(m,{color:e??y,width:r??a??x,height:i??a??x,strokeWidth:d??h,absoluteStrokeWidth:l??v,nonScalingStroke:c??b,className:o(E,u),hasA11yProp:S,attributes:g});return(0,n.createElement)(k,{ref:f,...P},[...N.map(([e,a])=>(0,n.createElement)(e,a)),...Array.isArray(_)?_:[_]])})},825:(e,a,r)=>{"use strict";r.d(a,{A:()=>s});var n=r(1811);let o={name:"download",size:24,node:[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]};o.node;let s=(0,n.A)(o)},1811:(e,a,r)=>{"use strict";r.d(a,{A:()=>s});var n=r(2115),o=r(209);function s(e,a=[],r=[]){let t,i="string"==typeof e?function(e,a,r=[]){if(null==a)throw Error("[lucide]: iconNode is required when icon name is used");return{name:e?.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),size:24,node:a,...r.length>0?{aliases:r}:{}}}(e,a,r):e,d=(0,n.forwardRef)(({className:e,...a},r)=>(0,n.createElement)(o.default,{ref:r,icon:i,className:e,...a}));return i.name&&(d.displayName=(t=(e=>{let a="",r=!1;for(let n of e){if("-"===n||"_"===n||n<=" "){r=a.length>0;continue}0===a.length?a+=n.toLowerCase():a+=r?n.toUpperCase():n,r=!1}return a})(i.name)).charAt(0).toUpperCase()+t.slice(1)),d}},2184:(e,a,r)=>{Promise.resolve().then(r.bind(r,5071))},2779:(e,a,r)=>{"use strict";r.d(a,{F$:()=>t,R6:()=>n,ZE:()=>o,oo:()=>s});let n=[{id:"todos",label:"Todos"},{id:"planificacion",label:"Planificaci\xf3n"},{id:"redes",label:"Redes sociales"},{id:"negocio",label:"Negocio"},{id:"carrera",label:"Carrera"},{id:"combos",label:"Combos"}],o=[{slug:"planner-mensual-luna",name:"Planner mensual Luna",shortName:"Planner Luna",tagline:"Doce meses en papel, sin aplicaciones que te distraigan.",description:"Un planner imprimible para organizar el mes, la semana y los h\xe1bitos. Pensado para quien vende, estudia o dirige un proyecto peque\xf1o y necesita ver el tiempo en una sola hoja.",price:1200,category:"planificacion",featured:!0,bestseller:!0,pages:"28 p\xe1ginas",format:"PDF A4 y US Letter",includes:["Portada y gu\xeda de uso","Calendario anual 2026","12 vistas mensuales","Planificador semanal","Tracker de h\xe1bitos y dinero"],details:["Imprime las hojas que uses, no el archivo entero.","M\xe1rgenes listos para encuadernar o meter en una carpeta.","Espacio para ingresos, gastos y una meta del mes."],cover:"planner",reviews:[{name:"Mariana Sol\xeds",city:"Guadalajara",quote:"Lo imprim\xed en una papeler\xeda de barrio y por fin dej\xe9 de saltar entre tres apps. El tracker de dinero es lo que m\xe1s uso.",rating:5},{name:"Iv\xe1n Herrera",city:"Madrid",quote:"Simple, bonito y sin relleno. En una tarde ten\xeda el trimestre a la vista.",rating:5}]},{slug:"pack-instagram-30",name:"Pack 30 posts para Instagram",shortName:"Pack Instagram",tagline:"Un mes de contenido listo para adaptar a tu marca.",description:"Treinta piezas editables para feed: anuncios, testimonios, listas, preguntas y ofertas. El copy est\xe1 en espa\xf1ol y se cambia en Canva en minutos.",price:1900,category:"redes",featured:!0,pages:"30 plantillas",format:"Canva (enlace de duplicado)",includes:["10 posts de autoridad","10 posts de oferta y prueba social","10 posts de comunidad y preguntas","Paleta y tipograf\xedas sugeridas","Gu\xeda de 4 p\xe1ginas para publicar sin atascarte"],details:["No necesitas Canva Pro para editar el pack base.","Tama\xf1os 1080\xd71350, listos para feed vertical.","Textos pensados para servicios, no para moda gen\xe9rica."],cover:"instagram",reviews:[{name:"Laura M\xe9ndez",city:"Bogot\xe1",quote:"En dos tardes arm\xe9 el mes. Vend\xed tres sesiones de marca personal con los posts de oferta.",rating:5}]},{slug:"kit-facturas",name:"Kit de facturas y presupuestos",shortName:"Kit facturas",tagline:"Cobra como un estudio, aunque trabajes desde la cocina.",description:"Plantillas para presupuestos, facturas, recibos y seguimiento de pagos. Listas para Google Docs y para imprimir en PDF. Incluyen campos de impuestos y condiciones de servicio en espa\xf1ol.",price:1500,category:"negocio",featured:!0,bestseller:!0,pages:"8 documentos",format:"Google Docs + PDF",includes:["Presupuesto con desglose de horas","Factura y nota de cr\xe9dito","Recibo de anticipo","Tabla de pagos pendientes","Cl\xe1usulas cortas de entrega y revisi\xf3n"],details:["Cambia logo, color y datos fiscales una sola vez.","Sirve para freelancers, talleres y tiendas peque\xf1as.","No sustituye un sistema contable: es para cobrar m\xe1s claro."],cover:"invoice",reviews:[{name:"Diego Paredes",city:"Lima",quote:"Mis clientes dejaron de preguntar ‘\xbfesto incluye IVA?’. El presupuesto se ve serio.",rating:5}]},{slug:"plantillas-cv",name:"Tres plantillas de CV",shortName:"Plantillas CV",tagline:"Un curr\xedculum que se lee en veinte segundos.",description:"Tres dise\xf1os de una p\xe1gina: estudio, producto y direcci\xf3n. Espacios para logros medibles, no para p\xe1rrafos de relleno. Incluyen carta de presentaci\xf3n corta.",price:900,category:"carrera",featured:!1,pages:"6 p\xe1ginas",format:"Google Docs + PDF",includes:["CV cl\xe1sico (una columna)","CV de producto / dise\xf1o","CV de liderazgo","Carta de presentaci\xf3n de media p\xe1gina","Lista de verbos de logro en espa\xf1ol"],details:["Pensados para lectura en pantalla y para imprimir en laser.","Sin columnas fr\xe1giles que se rompen al pegar en LinkedIn."],cover:"cv",reviews:[{name:"Camila Ruiz",city:"Santiago",quote:"Reescrib\xed mi CV en una noche. A la semana ten\xeda dos entrevistas.",rating:5}]},{slug:"calendario-editorial-2026",name:"Calendario editorial 2026",shortName:"Calendario 2026",tagline:"Fechas, campa\xf1as y huecos vac\xedos, en un solo tablero.",description:"Un calendario anual para quien publica contenido o lanza productos. Incluye festivos de M\xe9xico, Espa\xf1a, Colombia, Argentina y Estados Unidos, m\xe1s una columna para ofertas propias.",price:1400,category:"redes",featured:!1,pages:"16 p\xe1ginas",format:"PDF + Google Sheets",includes:["Vista anual y 12 meses","Festivos de 5 pa\xedses","Ideas de campa\xf1a por trimestre","Hoja de seguimiento de piezas publicadas"],details:["La hoja de c\xe1lculo se filtra por pa\xeds.","\xdasala junto al Pack Instagram o con tu propio dise\xf1o."],cover:"calendar",reviews:[{name:"Noelia Castro",city:"Buenos Aires",quote:"Por fin dej\xe9 de enterarme de Black Friday el mismo d\xeda. Lo tengo en la pared.",rating:4}]},{slug:"brand-kit-freelance",name:"Brand kit para freelancers",shortName:"Brand kit",tagline:"Una identidad peque\xf1a, coherente y lista para cobrar m\xe1s.",description:"Sistema de marca reducido: paleta, tipograf\xedas, logo wordmark, avatares, firma de correo y portadas. Pensado para consultores, fot\xf3grafos y estudios de una persona.",price:2400,category:"negocio",featured:!0,pages:"22 p\xe1ginas + archivos",format:"PDF + PNG + Canva",includes:["Gu\xeda de marca de 12 p\xe1ginas","4 variaciones de wordmark","Paleta y reglas de uso","Plantilla de propuesta comercial","Firma de correo y avatar"],details:["No es un logo a medida: es un sistema que adaptas con tu nombre.","Ideal si hoy usas Canva al azar y se nota."],cover:"brand",reviews:[{name:"Andr\xe9s Molina",city:"Monterrey",quote:"Sub\xed mis precios un 20% la semana siguiente. El PDF de propuesta se ve de estudio.",rating:5}]},{slug:"bundle-emprendedor",name:"Bundle Emprendedor",shortName:"Bundle",tagline:"Marca, cobro y contenido: lo que falta para abrir la tienda.",description:"El atajo si est\xe1s armando un negocio de servicios. Incluye el Brand kit, el Kit de facturas y el Pack de 30 posts, con un descuento frente a comprarlos sueltos.",price:3900,compareAt:5800,category:"combos",featured:!0,bestseller:!0,pages:"3 productos",format:"Canva + Docs + PDF",includes:["Brand kit para freelancers","Kit de facturas y presupuestos","Pack 30 posts para Instagram","Checklist de lanzamiento de 1 p\xe1gina"],details:["Ahorras 19 USD frente al precio suelto.","Descargas los tres archivos en la misma pantalla de pedido."],cover:"bundle",reviews:[{name:"Elena Vargas",city:"Valencia",quote:"En un fin de semana ten\xeda marca, factura y un mes de posts. Eso me desbloque\xf3.",rating:5}]},{slug:"lista-de-precios",name:"Lista de precios para servicios",shortName:"Lista de precios",tagline:"Deja de cotizar desde cero en cada mensaje de WhatsApp.",description:"Una hoja de precios clara para paquetes, horas y extras. Incluye ejemplos para dise\xf1o, tutor\xedas, fotograf\xeda y consultor\xeda, m\xe1s una versi\xf3n en blanco.",price:800,category:"negocio",featured:!1,pages:"5 p\xe1ginas",format:"PDF + Google Docs",includes:["Lista de paquetes (bueno / mejor / completo)","Lista por hora con m\xednimo","Extras y recargos","Texto corto para pegar en Instagram o WhatsApp"],details:["Los ejemplos son editables: borra el oficio que no sea el tuyo.","Combina bien con el Kit de facturas."],cover:"pricelist",reviews:[{name:"Pablo R\xedos",city:"Quito",quote:"Pas\xe9 de negociar cada trabajo a enviar un PDF. Cierro m\xe1s r\xe1pido.",rating:5}]}];function s(e){return o.find(a=>a.slug===e)}function t(e){return n.find(a=>a.id===e)?.label??e}},3321:(e,a,r)=>{"use strict";var n=r(4645);r.o(n,"usePathname")&&r.d(a,{usePathname:function(){return n.usePathname}}),r.o(n,"useRouter")&&r.d(a,{useRouter:function(){return n.useRouter}}),r.o(n,"useSearchParams")&&r.d(a,{useSearchParams:function(){return n.useSearchParams}})},4713:(e,a,r)=>{"use strict";function n(e){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"USD",minimumFractionDigits:0}).format(e/100)}r.d(a,{$:()=>n})},5071:(e,a,r)=>{"use strict";r.r(a),r.d(a,{default:()=>h});var n=r(5155),o=r(2115),s=r(3321),t=r(8500),i=r.n(t),d=r(825),l=r(9239),c=r(2779);function u(e,a,r){return{filename:`${e}.txt`,mime:"text/plain;charset=utf-8",content:`LUNA ATELIER — ${a}
${"=".repeat(40)}

${r.trim()}
`}}let _={"planner-mensual-luna":u("planner-mensual-luna","Planner mensual Luna",`
C\xd3MO USARLO
1. Imprime la portada y el mes en curso (A4 o Letter).
2. Elige 3 h\xe1bitos y 1 meta de dinero para las pr\xf3ximas 4 semanas.
3. Cada domingo, copia las 3 tareas que s\xed o s\xed deben ocurrir.

MES: _______________    META: ____________________________

SEMANA 1
Lun _____  Mar _____  Mi\xe9 _____  Jue _____  Vie _____  S\xe1b _____  Dom _____
Prioridad 1: ____________________
Prioridad 2: ____________________
Dinero: ingresos ______  gastos ______  neto ______

H\xc1BITOS (marca 7 d\xedas)
[ ] Dormir 7 h   [ ] Vender / prospectar   [ ] Mover el cuerpo   [ ] Cerrar el d\xeda

NOTA
Esta es la versi\xf3n de demostraci\xf3n incluida en la tienda.
La versi\xf3n completa a\xf1ade las 12 vistas mensuales y el calendario 2026.
`),"pack-instagram-30":u("pack-instagram-30","Pack 30 posts — gu\xeda de copy",`
ESTRUCTURA DE UN POST DE OFERTA (repite 4 veces al mes)
L\xednea 1: el resultado, no el servicio.
L\xednea 2: para qui\xe9n es (y para qui\xe9n no).
L\xednea 3: qu\xe9 incluye, en 3 vi\xf1etas.
L\xednea 4: precio o “escr\xedbeme la palabra LISTA”.
L\xednea 5: una prueba (n\xfamero, plazo o cliente).

10 GANCHOS EN ESPA\xd1OL
1. Si te piden “el logo para ayer”, cobra recargo.
2. Un mes de contenido no se improvisa el domingo.
3. Tu precio bajo no te hace m\xe1s amable: te hace invisible.
4. Tres paquetes. Un s\xed claro.
5. Lo que no est\xe1 en el presupuesto, no est\xe1 en el trabajo.
6. Publicar todos los d\xedas no vende. Publicar con oferta, s\xed.
7. Tu cliente no quiere un PDF. Quiere dejar de improvisar.
8. Cierra la semana con una historia de un trabajo entregado.
9. Si no tienes testimonios, pide uno hoy. Un audio basta.
10. El feed es un cat\xe1logo. Tr\xe1talo como tal.

En Canva: duplica el archivo y cambia nombre, color y precio.
`),"kit-facturas":u("kit-facturas","Kit de facturas — texto base",`
DATOS DEL EMISOR
Nombre / raz\xf3n social: ____________________
Correo: ____________________   WhatsApp: ____________________
Clave fiscal / NIF / RFC: ____________________

PRESUPUESTO N\xba ______
Cliente: ____________________    Fecha: __________    V\xe1lido 14 d\xedas

Concepto                         Cant.    Precio      Total
-------------------------------- ------ ---------- ----------
                                     
Condiciones: 50% al aceptar. El resto contra entrega.
Revisiones incluidas: 2. Extra: 40 USD / ronda.
Plazo estimado: ____ d\xedas h\xe1biles desde el anticipo.

FACTURA N\xba ______
Referencia del presupuesto: ______
Pagado: [ ] anticipo  [ ] total     M\xe9todo: _____________

Este archivo es la versi\xf3n de demostraci\xf3n. Duplica el Doc
y pega tu logo en la cabecera.
`),"plantillas-cv":u("plantillas-cv","CV — esqueleto de una p\xe1gina",`
NOMBRE APELLIDO
Rol al que aplicas  \xb7  Ciudad  \xb7  correo  \xb7  LinkedIn

PERFIL (3 l\xedneas, no 8)
Hago X para Y. En los \xfaltimos N a\xf1os logr\xe9 A, B y C.
Busco un equipo donde ______________.

EXPERIENCIA
Empresa — Rol (fechas)
• Logro con n\xfamero: ____________________
• Logro con n\xfamero: ____________________
• Contexto de equipo o stack: ____________________

PROYECTOS (si eres junior o freelance)
Nombre — resultado medible — enlace

EDUCACI\xd3N / IDIOMAS / HERRAMIENTAS
Una l\xednea cada uno. Sin relleno.

CARTA (media p\xe1gina)
P\xe1rrafo 1: por qu\xe9 esta empresa, con un detalle real.
P\xe1rrafo 2: una historia de 4 l\xedneas con un resultado.
P\xe1rrafo 3: disponibilidad y llamada a una conversaci\xf3n.
`),"calendario-editorial-2026":u("calendario-editorial-2026","Calendario editorial 2026 — recorte",`
TRIMESTRE 1 — ideas de campa\xf1a
Enero: reinicio, precios nuevos, “lo que no har\xe9 este a\xf1o”.
Febrero: San Valent\xedn B2B (regala una auditor\xeda corta).
Marzo: cierre de trimestre y casos de estudio.

FESTIVOS \xdaTILES (verifica el a\xf1o en tu pa\xeds)
MX: 5 may, 16 sep, 2 nov, 12 dic
ES: 6 ene, semana santa, 15 ago, 12 oct, 6/8 dic
CO: 20 jul, 7 ago, 8 dic
AR: 25 may, 9 jul, 8 dic
US: Memorial, 4 jul, Labor Day, Thanksgiving, Black Friday

HOJA DE SEGUIMIENTO
Fecha | Pieza | Canal | Objetivo | \xbfPublicada? | Resultado
`),"brand-kit-freelance":u("brand-kit-freelance","Brand kit — decisiones m\xednimas",`
NOMBRE P\xdaBLICO: ____________________
UNA FRASE: Ayudo a ______ a conseguir ______ sin ______.

PALETA (ejemplo Luna)
Tinta    #2A2118
Papel    #F4EBDD
Arcilla  #C45C26
Olivo    #5C6B4A
Arena    #E7D3B8

TIPOGRAF\xcdAS
T\xedtulos: una serif con car\xe1cter (Fraunces, Newsreader, Source Serif).
Cuerpo: una sans limpia (Outfit, Figtree, Source Sans).

REGLAS
1. Un color de acento, no cuatro.
2. Fotos con la misma luz. Si no hay fotos, usa papel y tipo.
3. La propuesta comercial usa la misma portada que el Instagram.
4. Firma de correo: nombre, rol, un solo enlace, nada de banners.

WORDMARK
Escribe tu nombre en la serif, tracking amplio, min\xfasculas.
Eso ya es un logo si lo usas siempre igual.
`),"bundle-emprendedor":u("bundle-emprendedor","Bundle Emprendedor — checklist de lanzamiento",`
FIN DE SEMANA 1
[ ] Elige nombre p\xfablico y frase de una l\xednea
[ ] Aplica paleta y tipograf\xedas a Canva
[ ] Sube avatar y portada
[ ] Escribe 3 paquetes de precio (bueno / mejor / completo)

FIN DE SEMANA 2
[ ] Duplica factura y presupuesto con tus datos
[ ] Publica 8 posts del pack (2 de oferta)
[ ] Pide un testimonio aunque sea de un favor
[ ] Pon el precio en la biograf\xeda, no “DM para info”

Este bundle incluye tambi\xe9n los archivos del Brand kit,
el Kit de facturas y el Pack Instagram. Desc\xe1rgalos uno a uno
desde la p\xe1gina del pedido.
`),"lista-de-precios":u("lista-de-precios","Lista de precios — plantilla",`
OFICIO: ____________________
V\xe1lida desde: __________    Pr\xf3xima revisi\xf3n: __________

BUENO — US$ ______
Para quien necesita ______ . Incluye ______. Entrega en __ d\xedas.
No incluye ______.

MEJOR — US$ ______   (el que quieres vender)
Para quien necesita ______. Incluye el paquete Bueno m\xe1s ______.
Cupos: __ al mes.

COMPLETO — US$ ______
Para equipos o lanzamientos. Incluye ______. Kickoff en 7 d\xedas.

EXTRAS
Urgencia (< 5 d\xedas h\xe1biles): +30%
Reuni\xf3n extra: US$ ______
Licencia comercial ampliada: US$ ______

TEXTO PARA WHATSAPP
Hola, trabajo con tres paquetes para que elijas sin cotizar
diez veces. Te los mando en un PDF de una p\xe1gina. \xbfTe lo env\xedo?
`)};function p({slug:e,label:a}){let[r,s]=(0,o.useState)(!1);return(0,n.jsxs)(l.$,{variant:"outline",className:"h-10 justify-start px-3",onClick:()=>{let a,r,n,o,t;n=new Blob([(r=(a=(0,c.oo)(e))&&_[e]||_[e]?_[e]:u(e,a?.name??e,"Archivo de demostraci\xf3n de Luna Atelier.")).content],{type:r.mime}),o=URL.createObjectURL(n),(t=document.createElement("a")).href=o,t.download=r.filename,document.body.appendChild(t),t.click(),t.remove(),URL.revokeObjectURL(o),s(!0)},children:[(0,n.jsx)(d.A,{}),r?"Descargado":a]})}var m=r(4713),g=r(9402);function f({id:e}){let a,r=(a=(0,o.useSyncExternalStore)(g._t,g.y,g.BO),(0,o.useMemo)(()=>{if(""!==a)return(0,g.r$)(e)},[e,a]));if(void 0===r)return(0,n.jsx)("p",{className:"text-sm text-muted-foreground",children:"Buscando el pedido…"});if(!r)return(0,n.jsxs)("div",{className:"rounded-2xl bg-card p-8 ring-1 ring-foreground/10",children:[(0,n.jsx)("h1",{className:"font-heading text-3xl",children:"No encontramos ese pedido"}),(0,n.jsx)("p",{className:"mt-3 max-w-md text-muted-foreground",children:"Los pedidos de esta demo se guardan en este navegador. Si abriste el enlace en otro dispositivo, no va a aparecer."}),(0,n.jsx)(l.$,{className:"mt-5 h-11 px-5",render:(0,n.jsx)(i(),{href:"/tienda"}),nativeButton:!1,children:"Volver a la tienda"})]});let s=new Date(r.createdAt).toLocaleString("es-ES",{dateStyle:"medium",timeStyle:"short"});return(0,n.jsxs)("div",{className:"rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8",children:[(0,n.jsxs)("p",{className:"text-sm text-muted-foreground",children:["Pedido ",r.id]}),(0,n.jsx)("h1",{className:"mt-1 font-heading text-3xl sm:text-4xl",children:"Listo. Tus archivos est\xe1n aqu\xed."}),(0,n.jsxs)("p",{className:"mt-3 max-w-xl text-muted-foreground",children:["Hola ",r.name,". En una tienda real este correo (",r.email,") recibir\xeda el enlace. Aqu\xed la descarga es inmediata."]}),(0,n.jsx)("p",{className:"mt-1 text-sm text-muted-foreground",children:s}),(0,n.jsx)("ul",{className:"mt-8 divide-y divide-border",children:r.items.map(e=>(0,n.jsxs)("li",{className:"flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",children:[(0,n.jsxs)("div",{children:[(0,n.jsx)("p",{className:"font-medium",children:e.name}),(0,n.jsxs)("p",{className:"text-sm text-muted-foreground",children:[e.quantity," \xd7 ",(0,m.$)(e.price)]})]}),(0,n.jsx)(p,{slug:e.slug,label:`Descargar ${e.name}`})]},e.slug))}),(0,n.jsxs)("div",{className:"mt-4 flex justify-between font-medium",children:[(0,n.jsx)("span",{children:"Total"}),(0,n.jsx)("span",{children:(0,m.$)(r.total)})]}),(0,n.jsxs)("div",{className:"mt-8 flex flex-wrap gap-3",children:[(0,n.jsx)(l.$,{className:"h-11 px-5",render:(0,n.jsx)(i(),{href:"/tienda"}),nativeButton:!1,children:"Seguir comprando"}),(0,n.jsx)(l.$,{variant:"outline",className:"h-11 px-5",render:(0,n.jsx)(i(),{href:"/como-vender"}),nativeButton:!1,children:"C\xf3mo vender esto de verdad"})]})]})}function x(){let e=(0,s.useSearchParams)().get("id")??"";return(0,n.jsx)(f,{id:e})}function h(){return(0,n.jsx)("div",{className:"mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14",children:(0,n.jsx)(o.Suspense,{fallback:(0,n.jsx)("p",{className:"text-sm text-muted-foreground",children:"Buscando el pedido…"}),children:(0,n.jsx)(x,{})})})}},9239:(e,a,r)=>{"use strict";r.d(a,{$:()=>d});var n=r(5155),o=r(5684),s=r(2747),t=r(888);let i=(0,s.F)("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/80",outline:"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",ghost:"hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",destructive:"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",xs:"h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",sm:"h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",lg:"h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",icon:"size-8","icon-xs":"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3","icon-sm":"size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg","icon-lg":"size-9"}},defaultVariants:{variant:"default",size:"default"}});function d({className:e,variant:a="default",size:r="default",...s}){return(0,n.jsx)(o.Button,{"data-slot":"button",className:(0,t.cn)(i({variant:a,size:r,className:e})),...s})}},9402:(e,a,r)=>{"use strict";r.d(a,{BO:()=>d,EB:()=>c,_t:()=>s,r$:()=>u,wq:()=>l,y:()=>i});let n="luna-atelier-orders",o=new Set;function s(e){return o.add(e),window.addEventListener("storage",e),()=>{o.delete(e),window.removeEventListener("storage",e)}}function t(){try{let e=window.localStorage.getItem(n);if(!e)return[];let a=JSON.parse(e);return Array.isArray(a)?a:[]}catch{return[]}}function i(){return window.localStorage.getItem(n)??"[]"}function d(){return""}function l(){let e=Date.now().toString(36).toUpperCase(),a=Math.random().toString(36).slice(2,6).toUpperCase();return`LA-${e}-${a}`}function c(e){let a=t().filter(a=>a.id!==e.id);a.unshift(e);var r=a.slice(0,30);for(let e of(window.localStorage.setItem(n,JSON.stringify(r)),o))e()}function u(e){return t().find(a=>a.id===e)??null}}},e=>{e.O(0,[8500,5684,3602,8441,3794,7358],()=>e(e.s=2184)),_N_E=e.O()}]);
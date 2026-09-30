=== Luna Oficio WebP ===
Contributors: lunaoficio
Tags: webp, imágenes, optimizar, rendimiento, pagespeed
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Convierte a WebP las imágenes que subes y, por lotes, toda la biblioteca de medios. Sin servicios externos.

== Description ==

* Convierte automáticamente cada JPG y PNG que se sube (original y todas las miniaturas).
* Conversor por lotes para la biblioteca existente, con progreso y registro. Continúa donde lo dejó.
* Actualiza las URL dentro de entradas, páginas y campos personalizados (incluidos datos serializados y JSON de maquetadores).
* Opción de conservar los originales para poder restaurar en un clic.
* Si el WebP pesa más que el original, deja la imagen como está.
* Todo ocurre en tu servidor con GD o Imagick. Ninguna imagen sale de tu hosting.

Forma parte de Luna Oficio Pro: https://lunaoficio.com/plugin-wordpress-webp/

== Installation ==

1. Plugins → Añadir nuevo → Subir plugin → elige luna-oficio-webp.zip → Instalar → Activar.
2. Ve a Medios → WebP.
3. Comprueba que el servidor «Puede escribir WebP: Sí». Si no, pide a tu hosting activar WebP en GD o Imagick.
4. Haz una copia de seguridad y pulsa «Convertir pendientes».

== Frequently Asked Questions ==

= ¿Borra mis imágenes originales? =

Solo si desmarcas «Conservar los JPG/PNG en el servidor». Por defecto se conservan y puedes restaurar.

= ¿Qué pasa con las URL de las imágenes en mis entradas? =

Se reescriben a la nueva extensión .webp, también en miniaturas y campos personalizados.

= ¿Funciona con Elementor, WPBakery, ACF…? =

Las URL guardadas en post meta (serializado o JSON) se actualizan. Las que viven en opciones del tema (fondos personalizados, logotipos por URL) hay que volver a seleccionarlas.

== Changelog ==

= 1.0.0 =
* Primera versión.

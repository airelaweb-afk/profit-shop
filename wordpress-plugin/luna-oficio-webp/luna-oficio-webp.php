<?php
/**
 * Plugin Name: Luna Oficio WebP
 * Plugin URI:  https://lunaoficio.com/plugin-wordpress-webp/
 * Description: Convierte a WebP las imágenes que subes y, por lotes, toda la biblioteca de medios (miniaturas incluidas). Actualiza las URL en entradas y páginas. Sin servicios externos: todo ocurre en tu servidor.
 * Version:     1.0.0
 * Author:      Luna Oficio (Airela Web)
 * Author URI:  https://lunaoficio.com/
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: luna-oficio-webp
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LUNA_WEBP_VERSION', '1.0.0' );
define( 'LUNA_WEBP_FILE', __FILE__ );
define( 'LUNA_WEBP_DIR', plugin_dir_path( __FILE__ ) );
define( 'LUNA_WEBP_URL', plugin_dir_url( __FILE__ ) );
define( 'LUNA_WEBP_OPTION', 'luna_webp_settings' );

require_once LUNA_WEBP_DIR . 'includes/class-luna-webp-settings.php';
require_once LUNA_WEBP_DIR . 'includes/class-luna-webp-converter.php';
require_once LUNA_WEBP_DIR . 'includes/class-luna-webp-admin.php';

/**
 * Converts freshly uploaded JPG/PNG attachments right after WordPress has
 * generated their thumbnails, so every size ends up as WebP.
 *
 * @param array $metadata      Attachment metadata (may be empty for non-images).
 * @param int   $attachment_id Attachment ID.
 * @return array
 */
function luna_webp_on_generate_metadata( $metadata, $attachment_id ) {
	$settings = Luna_WebP_Settings::get();
	if ( empty( $settings['on_upload'] ) ) {
		return $metadata;
	}
	if ( ! is_array( $metadata ) || empty( $metadata['file'] ) ) {
		return $metadata;
	}
	if ( ! Luna_WebP_Converter::is_convertible( $attachment_id ) ) {
		return $metadata;
	}
	$result = Luna_WebP_Converter::convert( (int) $attachment_id, $metadata, $settings, false );
	if ( is_wp_error( $result ) ) {
		return $metadata;
	}
	return $result['metadata'];
}
add_filter( 'wp_generate_attachment_metadata', 'luna_webp_on_generate_metadata', 20, 2 );

add_action(
	'plugins_loaded',
	static function () {
		if ( is_admin() ) {
			Luna_WebP_Admin::init();
		}
	}
);

register_activation_hook(
	__FILE__,
	static function () {
		Luna_WebP_Settings::ensure_defaults();
	}
);

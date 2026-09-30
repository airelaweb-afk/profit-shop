<?php
/**
 * Removes the plugin option. Converted images and their markers are kept on
 * purpose: deleting them would not bring the JPG/PNG back and would break
 * the media library.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'luna_webp_settings' );

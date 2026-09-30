<?php
/**
 * Plugin settings stored in one option.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Luna_WebP_Settings {

	/**
	 * Default values.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'quality'        => 82,
			'on_upload'      => 1,
			'keep_originals' => 1,
			'keep_if_bigger' => 1,
			'batch_size'     => 5,
		);
	}

	/**
	 * Current settings merged with defaults.
	 *
	 * @return array
	 */
	public static function get() {
		$stored = get_option( LUNA_WEBP_OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return self::sanitize( array_merge( self::defaults(), $stored ) );
	}

	/**
	 * Writes defaults on first activation so the settings page shows real values.
	 */
	public static function ensure_defaults() {
		if ( false === get_option( LUNA_WEBP_OPTION, false ) ) {
			add_option( LUNA_WEBP_OPTION, self::defaults() );
		}
	}

	/**
	 * Sanitizes raw input (Settings API callback).
	 *
	 * @param mixed $input Raw values.
	 * @return array
	 */
	public static function sanitize( $input ) {
		$defaults = self::defaults();
		$input    = is_array( $input ) ? $input : array();
		$quality  = isset( $input['quality'] ) ? (int) $input['quality'] : $defaults['quality'];
		$quality  = max( 40, min( 100, $quality ) );
		$batch    = isset( $input['batch_size'] ) ? (int) $input['batch_size'] : $defaults['batch_size'];
		$batch    = max( 1, min( 20, $batch ) );
		return array(
			'quality'        => $quality,
			'on_upload'      => empty( $input['on_upload'] ) ? 0 : 1,
			'keep_originals' => empty( $input['keep_originals'] ) ? 0 : 1,
			'keep_if_bigger' => empty( $input['keep_if_bigger'] ) ? 0 : 1,
			'batch_size'     => $batch,
		);
	}
}

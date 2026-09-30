<?php
/**
 * Converts attachments (original + every registered size) to WebP and keeps
 * the media library consistent: attached file, metadata, MIME type and the
 * URLs used inside posts and post meta.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Luna_WebP_Converter {

	const META_DONE      = '_luna_webp_done';
	const META_ORIGINALS = '_luna_webp_originals';

	/**
	 * MIME types the plugin converts.
	 *
	 * @var string[]
	 */
	private static $sources = array( 'image/jpeg', 'image/png' );

	/**
	 * Whether the server can write WebP through the WordPress image editor.
	 *
	 * @return bool
	 */
	public static function supported() {
		return (bool) wp_image_editor_supports( array( 'mime_type' => 'image/webp' ) );
	}

	/**
	 * Human readable description of the image library in use.
	 *
	 * @return string
	 */
	public static function engine() {
		if ( extension_loaded( 'imagick' ) && class_exists( 'Imagick' ) ) {
			$formats = array();
			try {
				$formats = ( new Imagick() )->queryFormats( 'WEBP' );
			} catch ( Exception $e ) {
				$formats = array();
			}
			if ( ! empty( $formats ) ) {
				return 'Imagick (con WebP)';
			}
		}
		if ( function_exists( 'imagewebp' ) ) {
			return 'GD (con WebP)';
		}
		return 'Sin soporte WebP en GD ni Imagick';
	}

	/**
	 * True when the attachment is a JPG/PNG that has not been processed yet.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	public static function is_convertible( $attachment_id ) {
		$mime = get_post_mime_type( $attachment_id );
		if ( ! in_array( $mime, self::$sources, true ) ) {
			return false;
		}
		return '' === (string) get_post_meta( $attachment_id, self::META_DONE, true );
	}

	/**
	 * Converts one attachment.
	 *
	 * @param int        $attachment_id Attachment ID.
	 * @param array|null $metadata      Metadata to work from (null = read from DB).
	 * @param array      $settings      Plugin settings.
	 * @param bool       $save_metadata Whether to persist the metadata (false when called from the
	 *                                  wp_generate_attachment_metadata filter, which saves it itself).
	 * @return array|WP_Error {status: converted|kept|skipped, metadata: array, before: int, after: int}
	 */
	public static function convert( $attachment_id, $metadata, $settings, $save_metadata = true ) {
		$attachment_id = (int) $attachment_id;
		if ( null === $metadata ) {
			$metadata = wp_get_attachment_metadata( $attachment_id );
		}
		if ( ! is_array( $metadata ) ) {
			$metadata = array();
		}
		$mime = get_post_mime_type( $attachment_id );
		if ( ! in_array( $mime, self::$sources, true ) ) {
			return array(
				'status'   => 'skipped',
				'metadata' => $metadata,
				'before'   => 0,
				'after'    => 0,
				'reason'   => 'No es JPG ni PNG.',
			);
		}
		if ( ! self::supported() ) {
			return new WP_Error( 'luna_webp_unsupported', 'El servidor no puede escribir WebP (falta soporte en GD/Imagick).' );
		}
		$file = get_attached_file( $attachment_id );
		if ( ! $file || ! file_exists( $file ) ) {
			return new WP_Error( 'luna_webp_missing', 'No se encuentra el archivo original en el servidor.' );
		}

		$quality        = isset( $settings['quality'] ) ? (int) $settings['quality'] : 82;
		$keep_originals = ! empty( $settings['keep_originals'] );
		$keep_if_bigger = ! empty( $settings['keep_if_bigger'] );

		$dir      = dirname( $file );
		$uploads  = wp_get_upload_dir();
		$old_rel  = ! empty( $metadata['file'] ) ? $metadata['file'] : _wp_relative_upload_path( $file );
		$old_url  = trailingslashit( $uploads['baseurl'] ) . ltrim( $old_rel, '/' );
		$url_dir  = dirname( $old_url );
		$before   = (int) filesize( $file );

		$main = self::write_webp( $file, $quality );
		if ( is_wp_error( $main ) ) {
			return $main;
		}
		if ( $keep_if_bigger && $main['filesize'] >= $before ) {
			if ( $main['path'] !== $file ) {
				wp_delete_file( $main['path'] );
			}
			update_post_meta( $attachment_id, self::META_DONE, 'kept' );
			return array(
				'status'   => 'kept',
				'metadata' => $metadata,
				'before'   => $before,
				'after'    => $before,
				'reason'   => 'El WebP pesaba más que el original; se deja tal cual.',
			);
		}

		$new_meta     = $metadata;
		$replacements = array();
		$originals    = array(
			'file'  => $old_rel,
			'sizes' => array(),
		);
		$to_delete    = array( $file );
		$after        = (int) $main['filesize'];

		$new_rel          = self::swap_extension( $old_rel );
		$new_meta['file']     = $new_rel;
		$new_meta['filesize'] = (int) $main['filesize'];
		$replacements[ $old_url ] = trailingslashit( $uploads['baseurl'] ) . ltrim( $new_rel, '/' );

		if ( ! empty( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ) {
			$done_files = array();
			foreach ( $metadata['sizes'] as $size_name => $size ) {
				if ( empty( $size['file'] ) ) {
					continue;
				}
				$size_mime = isset( $size['mime-type'] ) ? $size['mime-type'] : '';
				if ( $size_mime && ! in_array( $size_mime, self::$sources, true ) ) {
					continue;
				}
				$size_path = $dir . '/' . $size['file'];
				if ( ! file_exists( $size_path ) ) {
					continue;
				}
				if ( isset( $done_files[ $size['file'] ] ) ) {
					$result = $done_files[ $size['file'] ];
				} else {
					$result = self::write_webp( $size_path, $quality );
					if ( is_wp_error( $result ) ) {
						// A failing thumbnail should not abort the whole attachment; the size keeps its JPG/PNG.
						continue;
					}
					$done_files[ $size['file'] ] = $result;
					$to_delete[]                 = $size_path;
					$after                      += (int) $result['filesize'];
					$before                     += (int) filesize( $size_path );
				}
				$originals['sizes'][ $size_name ]           = $size['file'];
				$new_meta['sizes'][ $size_name ]['file']      = basename( $result['path'] );
				$new_meta['sizes'][ $size_name ]['mime-type'] = 'image/webp';
				$new_meta['sizes'][ $size_name ]['filesize']  = (int) $result['filesize'];
				$replacements[ $url_dir . '/' . $size['file'] ] = $url_dir . '/' . basename( $result['path'] );
			}
		}

		update_attached_file( $attachment_id, $main['path'] );
		wp_update_post(
			array(
				'ID'             => $attachment_id,
				'post_mime_type' => 'image/webp',
			)
		);
		if ( $save_metadata ) {
			wp_update_attachment_metadata( $attachment_id, $new_meta );
		}
		update_post_meta( $attachment_id, self::META_ORIGINALS, $originals );
		update_post_meta( $attachment_id, self::META_DONE, time() );

		self::replace_urls( $replacements );

		if ( ! $keep_originals ) {
			foreach ( array_unique( $to_delete ) as $path ) {
				wp_delete_file( $path );
			}
			update_post_meta( $attachment_id, self::META_ORIGINALS, array_merge( $originals, array( 'deleted' => 1 ) ) );
		}

		return array(
			'status'   => 'converted',
			'metadata' => $new_meta,
			'before'   => $before,
			'after'    => $after,
		);
	}

	/**
	 * Puts an attachment back to its JPG/PNG files if they are still on disk.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return true|WP_Error
	 */
	public static function restore( $attachment_id ) {
		$attachment_id = (int) $attachment_id;
		$originals     = get_post_meta( $attachment_id, self::META_ORIGINALS, true );
		$done          = get_post_meta( $attachment_id, self::META_DONE, true );
		if ( 'kept' === $done ) {
			delete_post_meta( $attachment_id, self::META_DONE );
			return true;
		}
		if ( ! is_array( $originals ) || empty( $originals['file'] ) ) {
			return new WP_Error( 'luna_webp_no_originals', 'Este adjunto no fue convertido por el plugin.' );
		}
		if ( ! empty( $originals['deleted'] ) ) {
			return new WP_Error( 'luna_webp_deleted', 'Los originales se borraron al convertir; no se puede restaurar.' );
		}
		$uploads   = wp_get_upload_dir();
		$old_path  = trailingslashit( $uploads['basedir'] ) . ltrim( $originals['file'], '/' );
		if ( ! file_exists( $old_path ) ) {
			return new WP_Error( 'luna_webp_missing', 'El original ya no está en el servidor.' );
		}
		$metadata = wp_get_attachment_metadata( $attachment_id );
		if ( ! is_array( $metadata ) ) {
			$metadata = array();
		}
		$current_file = get_attached_file( $attachment_id );
		$dir          = dirname( $old_path );
		$url_dir      = dirname( trailingslashit( $uploads['baseurl'] ) . ltrim( $originals['file'], '/' ) );
		$replacements = array();
		$webp_files   = array();

		if ( $current_file && $current_file !== $old_path ) {
			$webp_files[] = $current_file;
		}
		$replacements[ trailingslashit( $uploads['baseurl'] ) . ltrim( $metadata['file'], '/' ) ] = trailingslashit( $uploads['baseurl'] ) . ltrim( $originals['file'], '/' );
		$metadata['file'] = $originals['file'];
		$metadata['filesize'] = (int) filesize( $old_path );

		if ( ! empty( $originals['sizes'] ) && is_array( $originals['sizes'] ) ) {
			foreach ( $originals['sizes'] as $size_name => $old_file ) {
				if ( empty( $metadata['sizes'][ $size_name ] ) ) {
					continue;
				}
				$webp_name = $metadata['sizes'][ $size_name ]['file'];
				if ( $webp_name !== $old_file ) {
					$webp_files[]                                   = $dir . '/' . $webp_name;
					$replacements[ $url_dir . '/' . $webp_name ] = $url_dir . '/' . $old_file;
				}
				$type = wp_check_filetype( $old_file );
				$metadata['sizes'][ $size_name ]['file']      = $old_file;
				$metadata['sizes'][ $size_name ]['mime-type'] = $type['type'] ? $type['type'] : 'image/jpeg';
				if ( file_exists( $dir . '/' . $old_file ) ) {
					$metadata['sizes'][ $size_name ]['filesize'] = (int) filesize( $dir . '/' . $old_file );
				}
			}
		}

		$type = wp_check_filetype( $old_path );
		update_attached_file( $attachment_id, $old_path );
		wp_update_post(
			array(
				'ID'             => $attachment_id,
				'post_mime_type' => $type['type'] ? $type['type'] : 'image/jpeg',
			)
		);
		wp_update_attachment_metadata( $attachment_id, $metadata );
		self::replace_urls( $replacements );
		foreach ( array_unique( $webp_files ) as $path ) {
			if ( file_exists( $path ) ) {
				wp_delete_file( $path );
			}
		}
		delete_post_meta( $attachment_id, self::META_ORIGINALS );
		delete_post_meta( $attachment_id, self::META_DONE );
		return true;
	}

	/**
	 * IDs of JPG/PNG attachments still pending.
	 *
	 * @param int $limit How many to return.
	 * @return int[]
	 */
	public static function pending_ids( $limit ) {
		global $wpdb;
		$sql = $wpdb->prepare(
			"SELECT p.ID FROM {$wpdb->posts} p
			 LEFT JOIN {$wpdb->postmeta} m ON m.post_id = p.ID AND m.meta_key = %s
			 WHERE p.post_type = 'attachment' AND p.post_mime_type IN ('image/jpeg','image/png') AND m.meta_id IS NULL
			 ORDER BY p.ID ASC LIMIT %d",
			self::META_DONE,
			max( 1, (int) $limit )
		);
		return array_map( 'intval', (array) $wpdb->get_col( $sql ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	}

	/**
	 * Counters for the admin screen.
	 *
	 * @return array {pending: int, converted: int, kept: int}
	 */
	public static function counts() {
		global $wpdb;
		$pending = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->posts} p
				 LEFT JOIN {$wpdb->postmeta} m ON m.post_id = p.ID AND m.meta_key = %s
				 WHERE p.post_type = 'attachment' AND p.post_mime_type IN ('image/jpeg','image/png') AND m.meta_id IS NULL",
				self::META_DONE
			)
		);
		$kept      = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = 'kept'", self::META_DONE ) );
		$converted = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value <> 'kept'", self::META_DONE ) );
		return array(
			'pending'   => $pending,
			'converted' => $converted,
			'kept'      => $kept,
		);
	}

	/**
	 * Writes a WebP next to the given image and returns the editor's save() result.
	 *
	 * @param string $path    Source image path.
	 * @param int    $quality 40-100.
	 * @return array|WP_Error
	 */
	private static function write_webp( $path, $quality ) {
		$editor = wp_get_image_editor( $path );
		if ( is_wp_error( $editor ) ) {
			return $editor;
		}
		$editor->set_quality( max( 40, min( 100, (int) $quality ) ) );
		$dest  = self::swap_extension( $path );
		$saved = $editor->save( $dest, 'image/webp' );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}
		if ( empty( $saved['filesize'] ) && ! empty( $saved['path'] ) && file_exists( $saved['path'] ) ) {
			$saved['filesize'] = (int) filesize( $saved['path'] );
		}
		return $saved;
	}

	/**
	 * foto.jpg -> foto.webp (keeps directories untouched).
	 *
	 * @param string $path File name or path.
	 * @return string
	 */
	private static function swap_extension( $path ) {
		return preg_replace( '/\.(jpe?g|png)$/i', '.webp', $path );
	}

	/**
	 * Replaces old URLs with new ones in post content and post meta. Serialized
	 * meta is unserialized first so string lengths stay valid; JSON-escaped
	 * variants (Elementor & co.) are handled too.
	 *
	 * @param array $map old_url => new_url.
	 */
	private static function replace_urls( array $map ) {
		global $wpdb;
		$search  = array();
		$replace = array();
		foreach ( $map as $old => $new ) {
			if ( ! $old || $old === $new ) {
				continue;
			}
			$search[]  = $old;
			$replace[] = $new;
			$search[]  = str_replace( '/', '\/', $old );
			$replace[] = str_replace( '/', '\/', $new );
		}
		if ( empty( $search ) ) {
			return;
		}

		foreach ( $map as $old => $new ) {
			if ( ! $old || $old === $new ) {
				continue;
			}
			$escaped_old = str_replace( '/', '\/', $old );
			$escaped_new = str_replace( '/', '\/', $new );
			$wpdb->query(
				$wpdb->prepare(
					"UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s) WHERE post_content LIKE %s",
					$old,
					$new,
					'%' . $wpdb->esc_like( $old ) . '%'
				)
			);
			$wpdb->query(
				$wpdb->prepare(
					"UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, %s, %s) WHERE post_content LIKE %s",
					$escaped_old,
					$escaped_new,
					'%' . $wpdb->esc_like( $escaped_old ) . '%'
				)
			);

			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT meta_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key NOT IN (%s, %s) AND (meta_value LIKE %s OR meta_value LIKE %s)",
					self::META_ORIGINALS,
					'_wp_attached_file',
					'%' . $wpdb->esc_like( $old ) . '%',
					'%' . $wpdb->esc_like( $escaped_old ) . '%'
				)
			);
			foreach ( (array) $rows as $row ) {
				$value = $row->meta_value;
				if ( is_serialized( $value ) ) {
					$data      = maybe_unserialize( $value );
					$data      = map_deep(
						$data,
						static function ( $item ) use ( $search, $replace ) {
							return is_string( $item ) ? str_replace( $search, $replace, $item ) : $item;
						}
					);
					$new_value = maybe_serialize( $data );
				} else {
					$new_value = str_replace( $search, $replace, $value );
				}
				if ( $new_value !== $value ) {
					$wpdb->update( $wpdb->postmeta, array( 'meta_value' => $new_value ), array( 'meta_id' => (int) $row->meta_id ) );
				}
			}
		}
		wp_cache_flush();
	}
}

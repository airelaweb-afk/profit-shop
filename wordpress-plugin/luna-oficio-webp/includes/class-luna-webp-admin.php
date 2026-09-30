<?php
/**
 * Admin screen (Medios → WebP), settings, AJAX batch endpoints and the
 * per-attachment row action.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Luna_WebP_Admin {

	const PAGE       = 'luna-oficio-webp';
	const CAPABILITY = 'manage_options';
	const NONCE      = 'luna_webp_nonce';

	/**
	 * Registers hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'wp_ajax_luna_webp_batch', array( __CLASS__, 'ajax_batch' ) );
		add_action( 'wp_ajax_luna_webp_restore_batch', array( __CLASS__, 'ajax_restore_batch' ) );
		add_action( 'wp_ajax_luna_webp_counts', array( __CLASS__, 'ajax_counts' ) );
		add_filter( 'media_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
		add_action( 'admin_post_luna_webp_convert_one', array( __CLASS__, 'convert_one' ) );
		add_action( 'admin_post_luna_webp_restore_one', array( __CLASS__, 'restore_one' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notices' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( LUNA_WEBP_FILE ), array( __CLASS__, 'plugin_links' ) );
	}

	/**
	 * Medios → WebP.
	 */
	public static function menu() {
		add_media_page(
			'WebP · Luna Oficio',
			'WebP',
			self::CAPABILITY,
			self::PAGE,
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Settings API wiring.
	 */
	public static function register_settings() {
		register_setting(
			'luna_webp_group',
			LUNA_WEBP_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( 'Luna_WebP_Settings', 'sanitize' ),
				'default'           => Luna_WebP_Settings::defaults(),
			)
		);
	}

	/**
	 * Only loads the tiny script/styles on our own screen.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public static function assets( $hook ) {
		if ( 'media_page_' . self::PAGE !== $hook ) {
			return;
		}
		wp_enqueue_style( 'luna-webp-admin', LUNA_WEBP_URL . 'assets/admin.css', array(), LUNA_WEBP_VERSION );
		wp_enqueue_script( 'luna-webp-admin', LUNA_WEBP_URL . 'assets/admin.js', array(), LUNA_WEBP_VERSION, true );
		wp_localize_script(
			'luna-webp-admin',
			'lunaWebp',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( self::NONCE ),
			)
		);
	}

	/**
	 * Adds "Ajustes" next to Activar/Desactivar in the plugin list.
	 *
	 * @param array $links Existing links.
	 * @return array
	 */
	public static function plugin_links( $links ) {
		$url = admin_url( 'upload.php?page=' . self::PAGE );
		array_unshift( $links, '<a href="' . esc_url( $url ) . '">Ajustes</a>' );
		return $links;
	}

	/**
	 * Screen markup.
	 */
	public static function render() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$settings  = Luna_WebP_Settings::get();
		$counts    = Luna_WebP_Converter::counts();
		$supported = Luna_WebP_Converter::supported();
		?>
		<div class="wrap luna-webp">
			<h1>WebP · Luna Oficio</h1>
			<p class="description">
				Convierte a WebP lo que subas y, por lotes, toda la biblioteca de medios. Todo ocurre en este servidor:
				ninguna imagen se envía a un servicio externo.
			</p>

			<div class="luna-webp-grid">
				<div class="luna-webp-card">
					<h2>Estado del servidor</h2>
					<p>
						<strong>Librería:</strong> <?php echo esc_html( Luna_WebP_Converter::engine() ); ?><br>
						<strong>Puede escribir WebP:</strong>
						<?php if ( $supported ) : ?>
							<span class="luna-webp-ok">Sí</span>
						<?php else : ?>
							<span class="luna-webp-ko">No</span>. Pide a tu hosting activar WebP en GD o Imagick; hasta entonces el plugin no convierte nada.
						<?php endif; ?>
					</p>
					<p>
						<strong>Pendientes (JPG/PNG):</strong> <span id="luna-webp-pending"><?php echo (int) $counts['pending']; ?></span><br>
						<strong>Convertidas:</strong> <span id="luna-webp-converted"><?php echo (int) $counts['converted']; ?></span><br>
						<strong>Sin tocar por pesar menos:</strong> <span id="luna-webp-kept"><?php echo (int) $counts['kept']; ?></span>
					</p>
				</div>

				<div class="luna-webp-card">
					<h2>Convertir toda la biblioteca</h2>
					<p>
						Recorre los adjuntos JPG y PNG en tandas de <?php echo (int) $settings['batch_size']; ?>, convierte el original y todas las
						miniaturas, y actualiza las URL dentro de entradas, páginas y campos personalizados. Puedes cerrar la pestaña y seguir
						después: continúa donde lo dejó.
					</p>
					<p class="luna-webp-actions">
						<button type="button" class="button button-primary button-hero" id="luna-webp-start" <?php disabled( ! $supported ); ?>>Convertir pendientes</button>
						<button type="button" class="button button-hero" id="luna-webp-stop" disabled>Parar</button>
						<button type="button" class="button button-link-delete" id="luna-webp-restore">Restaurar originales</button>
					</p>
					<div class="luna-webp-progress" hidden>
						<div class="luna-webp-bar"><span id="luna-webp-bar-fill"></span></div>
						<p id="luna-webp-progress-text"></p>
					</div>
					<ul id="luna-webp-log" class="luna-webp-log"></ul>
					<p class="description">
						«Restaurar originales» deshace la conversión de los adjuntos cuyos JPG/PNG sigan en el servidor (solo posible si no
						marcaste borrar originales).
					</p>
				</div>
			</div>

			<form method="post" action="options.php" class="luna-webp-card">
				<?php settings_fields( 'luna_webp_group' ); ?>
				<h2>Ajustes</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="luna-webp-quality">Calidad WebP</label></th>
						<td>
							<input type="number" min="40" max="100" id="luna-webp-quality" name="<?php echo esc_attr( LUNA_WEBP_OPTION ); ?>[quality]" value="<?php echo (int) $settings['quality']; ?>" class="small-text">
							<p class="description">82 es un buen equilibrio para una web. Para fotografía de producto, 85-90.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Al subir</th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( LUNA_WEBP_OPTION ); ?>[on_upload]" value="1" <?php checked( $settings['on_upload'] ); ?>>
								Convertir automáticamente cada JPG/PNG que se suba a la biblioteca
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row">Originales</th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( LUNA_WEBP_OPTION ); ?>[keep_originals]" value="1" <?php checked( $settings['keep_originals'] ); ?>>
								Conservar los JPG/PNG en el servidor (permite restaurar; ocupa más disco)
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row">Si el WebP pesa más</th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( LUNA_WEBP_OPTION ); ?>[keep_if_bigger]" value="1" <?php checked( $settings['keep_if_bigger'] ); ?>>
								Dejar la imagen como está (evita empeorar PNG muy simples)
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="luna-webp-batch">Imágenes por tanda</label></th>
						<td>
							<input type="number" min="1" max="20" id="luna-webp-batch" name="<?php echo esc_attr( LUNA_WEBP_OPTION ); ?>[batch_size]" value="<?php echo (int) $settings['batch_size']; ?>" class="small-text">
							<p class="description">Baja el número si tu hosting corta las peticiones largas.</p>
						</td>
					</tr>
				</table>
				<?php submit_button( 'Guardar ajustes' ); ?>
			</form>

			<p class="description luna-webp-foot">
				Luna Oficio WebP <?php echo esc_html( LUNA_WEBP_VERSION ); ?> · Parte de <a href="https://lunaoficio.com/plugin-wordpress-webp/" target="_blank" rel="noopener">Luna Oficio Pro</a>.
				Las URL que viven en opciones del tema (por ejemplo, fondos personalizados) no se reescriben: vuelve a seleccionar la imagen ahí.
			</p>
		</div>
		<?php
	}

	/**
	 * Shared guard for AJAX handlers.
	 */
	private static function check_ajax() {
		if ( ! current_user_can( self::CAPABILITY ) || ! check_ajax_referer( self::NONCE, 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => 'Sin permiso.' ), 403 );
		}
	}

	/**
	 * Converts one batch of pending attachments.
	 */
	public static function ajax_batch() {
		self::check_ajax();
		$settings = Luna_WebP_Settings::get();
		if ( ! Luna_WebP_Converter::supported() ) {
			wp_send_json_error( array( 'message' => 'El servidor no puede escribir WebP.' ) );
		}
		// Thumbnails of large photos take a while; give the batch room to finish.
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}
		$ids  = Luna_WebP_Converter::pending_ids( $settings['batch_size'] );
		$done = array();
		foreach ( $ids as $id ) {
			$result = Luna_WebP_Converter::convert( $id, null, $settings, true );
			if ( is_wp_error( $result ) ) {
				// Mark it so the loop never gets stuck on a broken file; the reason is shown in the log.
				update_post_meta( $id, Luna_WebP_Converter::META_DONE, 'kept' );
				$done[] = array(
					'id'     => $id,
					'title'  => get_the_title( $id ),
					'status' => 'error',
					'reason' => $result->get_error_message(),
				);
				continue;
			}
			$done[] = array(
				'id'     => $id,
				'title'  => get_the_title( $id ),
				'status' => $result['status'],
				'before' => $result['before'],
				'after'  => $result['after'],
				'reason' => isset( $result['reason'] ) ? $result['reason'] : '',
			);
		}
		wp_send_json_success(
			array(
				'items'  => $done,
				'counts' => Luna_WebP_Converter::counts(),
			)
		);
	}

	/**
	 * Restores one batch of converted attachments.
	 */
	public static function ajax_restore_batch() {
		global $wpdb;
		self::check_ajax();
		$settings = Luna_WebP_Settings::get();
		$ids      = array_map(
			'intval',
			(array) $wpdb->get_col(
				$wpdb->prepare(
					"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s ORDER BY post_id ASC LIMIT %d",
					Luna_WebP_Converter::META_DONE,
					max( 1, (int) $settings['batch_size'] )
				)
			)
		);
		$done = array();
		foreach ( $ids as $id ) {
			$result = Luna_WebP_Converter::restore( $id );
			if ( is_wp_error( $result ) ) {
				// Leave the marker out so the loop can end; the attachment stays as WebP.
				delete_post_meta( $id, Luna_WebP_Converter::META_DONE );
				$done[] = array(
					'id'     => $id,
					'title'  => get_the_title( $id ),
					'status' => 'error',
					'reason' => $result->get_error_message(),
				);
				continue;
			}
			$done[] = array(
				'id'     => $id,
				'title'  => get_the_title( $id ),
				'status' => 'restored',
			);
		}
		wp_send_json_success(
			array(
				'items'     => $done,
				'remaining' => (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s", Luna_WebP_Converter::META_DONE ) ),
				'counts'    => Luna_WebP_Converter::counts(),
			)
		);
	}

	/**
	 * Counters only.
	 */
	public static function ajax_counts() {
		self::check_ajax();
		wp_send_json_success( Luna_WebP_Converter::counts() );
	}

	/**
	 * Row action in Medios (list view).
	 *
	 * @param array   $actions Existing actions.
	 * @param WP_Post $post    Attachment.
	 * @return array
	 */
	public static function row_actions( $actions, $post ) {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return $actions;
		}
		if ( Luna_WebP_Converter::is_convertible( $post->ID ) ) {
			$url = wp_nonce_url(
				admin_url( 'admin-post.php?action=luna_webp_convert_one&attachment=' . (int) $post->ID ),
				'luna_webp_one_' . $post->ID
			);
			$actions['luna_webp'] = '<a href="' . esc_url( $url ) . '">Convertir a WebP</a>';
		} elseif ( 'image/webp' === $post->post_mime_type && get_post_meta( $post->ID, Luna_WebP_Converter::META_ORIGINALS, true ) ) {
			$url = wp_nonce_url(
				admin_url( 'admin-post.php?action=luna_webp_restore_one&attachment=' . (int) $post->ID ),
				'luna_webp_one_' . $post->ID
			);
			$actions['luna_webp'] = '<a href="' . esc_url( $url ) . '">Restaurar JPG/PNG</a>';
		}
		return $actions;
	}

	/**
	 * admin-post handler for the row action.
	 */
	public static function convert_one() {
		$id = isset( $_GET['attachment'] ) ? (int) $_GET['attachment'] : 0;
		if ( ! current_user_can( self::CAPABILITY ) || ! $id || ! wp_verify_nonce( isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ) : '', 'luna_webp_one_' . $id ) ) {
			wp_die( 'Sin permiso.' );
		}
		$result = Luna_WebP_Converter::convert( $id, null, Luna_WebP_Settings::get(), true );
		$code   = is_wp_error( $result ) ? 'error' : $result['status'];
		wp_safe_redirect( add_query_arg( array( 'luna_webp' => $code ), wp_get_referer() ? wp_get_referer() : admin_url( 'upload.php?mode=list' ) ) );
		exit;
	}

	/**
	 * admin-post handler for restoring one attachment.
	 */
	public static function restore_one() {
		$id = isset( $_GET['attachment'] ) ? (int) $_GET['attachment'] : 0;
		if ( ! current_user_can( self::CAPABILITY ) || ! $id || ! wp_verify_nonce( isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ) : '', 'luna_webp_one_' . $id ) ) {
			wp_die( 'Sin permiso.' );
		}
		$result = Luna_WebP_Converter::restore( $id );
		$code   = is_wp_error( $result ) ? 'error' : 'restored';
		wp_safe_redirect( add_query_arg( array( 'luna_webp' => $code ), wp_get_referer() ? wp_get_referer() : admin_url( 'upload.php?mode=list' ) ) );
		exit;
	}

	/**
	 * Feedback after a row action.
	 */
	public static function notices() {
		if ( empty( $_GET['luna_webp'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		$code     = sanitize_key( wp_unslash( $_GET['luna_webp'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$messages = array(
			'converted' => array( 'success', 'Imagen convertida a WebP, miniaturas incluidas.' ),
			'kept'      => array( 'info', 'El WebP pesaba más que el original: se ha dejado como estaba.' ),
			'skipped'   => array( 'info', 'Ese adjunto no es un JPG ni un PNG.' ),
			'restored'  => array( 'success', 'Imagen restaurada a su JPG/PNG original.' ),
			'error'     => array( 'error', 'No se pudo completar la operación. Revisa que el archivo exista y que el servidor soporte WebP.' ),
		);
		if ( ! isset( $messages[ $code ] ) ) {
			return;
		}
		printf(
			'<div class="notice notice-%1$s is-dismissible"><p>%2$s</p></div>',
			esc_attr( $messages[ $code ][0] ),
			esc_html( $messages[ $code ][1] )
		);
	}
}

<?php
/**
 * Plugin Name:  CS WPGraphQL Auto-Bridge
 * Plugin URI:   https://cortinastudio.com.gt
 * Description:  Expone automaticamente todos los CPTs y meta fields a WPGraphQL.
 *               CPTs: detectados por lista negra (funciona con cualquier plugin/version).
 *               Meta fields: leidos de bridge-fields.json (unico archivo que cambia por cliente).
 *               Para un cliente nuevo: copia el plugin, actualiza bridge-fields.json. Cero PHP.
 * Version:      3.1.0
 * Author:       Cortina Studio
 * License:      Private
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CSB_VERSION', '3.1.0' );
define( 'CSB_DIR', plugin_dir_path( __FILE__ ) );
define( 'CSB_FIELDS_FILE', CSB_DIR . 'bridge-fields.json' );

// Post types de WordPress core + tipos internos de plugins que NO se deben exponer.
// Agrega aqui cualquier tipo interno de plugin que quieras excluir.
define( 'CSB_EXCLUDED_TYPES', serialize( [
	// WordPress core
	'post', 'page', 'attachment', 'revision', 'nav_menu_item',
	'custom_css', 'customize_changeset', 'oembed_cache', 'user_request',
	'wp_block', 'wp_template', 'wp_template_part', 'wp_global_styles',
	'wp_navigation', 'wp_font_family', 'wp_font_face',
	// JetEngine internos
	'jet-engine', 'jet_engine',
	// WPGraphQL internos
	'graphql_document',
	// Yoast / RankMath internos
	'yst_prominent_words',
] ) );


// ======================================================
// BLOQUE 1 - EXPONER CPTs A WPGRAPHQL
// Enfoque lista negra: cualquier post type que NO este
// en CSB_EXCLUDED_TYPES se expone automaticamente.
// Usa los labels registrados por WordPress para generar
// los nombres GraphQL — sin depender del plugin que creo el CPT.
// ======================================================

add_filter( 'register_post_type_args', 'csb_expose_custom_cpt', 10, 2 );

function csb_expose_custom_cpt( array $args, string $post_type ): array {
	$excluded = unserialize( CSB_EXCLUDED_TYPES );

	if ( in_array( $post_type, $excluded, true ) ) {
		return $args;
	}

	if ( isset( $args['show_in_graphql'] ) ) {
		return $args;
	}

	$is_public = $args['public']  ?? false;
	$has_ui    = $args['show_ui'] ?? false;
	if ( ! $is_public && ! $has_ui ) {
		return $args;
	}

	// Leer labels con soporte para array (JetEngine) y objeto (WP nativo)
	$labels_raw = $args['labels'] ?? null;
	if ( is_object( $labels_raw ) ) {
		$singular = trim( $labels_raw->singular_name ?? '' ) ?: null;
		$plural   = trim( $labels_raw->name          ?? '' ) ?: null;
	} elseif ( is_array( $labels_raw ) ) {
		$singular = trim( $labels_raw['singular_name'] ?? '' ) ?: null;
		$plural   = trim( $labels_raw['name']          ?? '' ) ?: null;
	} else {
		$singular = null;
		$plural   = null;
	}

	// Intentar derivar nombres desde labels
	$gql_single_from_label = $singular ? csb_to_graphql_name( $singular ) : null;
	$gql_plural_from_label = $plural   ? csb_to_graphql_name( $plural )   : null;

	if ( $gql_single_from_label && $gql_plural_from_label && $gql_single_from_label !== $gql_plural_from_label ) {
		// Labels dan singular y plural distintos: caso ideal
		$gql_single = $gql_single_from_label;
		$gql_plural = $gql_plural_from_label;
	} else {
		// Labels vacios o iguales: usar el slug como desambiguador
		// Convencion WP: el slug suele ser la forma plural
		$slug_name = csb_to_graphql_name( $post_type );
		if ( substr( $slug_name, -1 ) === 's' ) {
			// Slug termina en 's' → es el plural (ej. 'proyectos')
			// Quitar la 's' final para derivar el singular ('proyecto')
			$gql_plural = $slug_name;
			$gql_single = substr( $slug_name, 0, -1 );
		} else {
			// Slug no termina en 's' → usarlo como singular, agregar 's' para plural
			$gql_single = $slug_name;
			$gql_plural = $slug_name . 's';
		}
	}

	$args['show_in_graphql']     = true;
	$args['graphql_single_name'] = $gql_single;
	$args['graphql_plural_name'] = $gql_plural;

	return $args;
}


// ======================================================
// BLOQUE 2 - REGISTRAR META FIELDS EN WPGRAPHQL
// Lee bridge-fields.json y registra cada campo definido.
// ======================================================

add_action( 'graphql_register_types', 'csb_register_fields_from_config' );

function csb_register_fields_from_config(): void {
	$config = csb_load_fields_config();

	if ( empty( $config ) ) {
		return;
	}

	foreach ( $config as $post_type => $field_groups ) {
		// Las claves con prefijo "_" son meta-configuracion (ej. _options para options pages),
		// no CPTs. Se procesan en otro handler.
		if ( strpos( (string) $post_type, '_' ) === 0 ) {
			continue;
		}

		$pt_obj = get_post_type_object( $post_type );
		if ( ! $pt_obj || empty( $pt_obj->graphql_single_name ) ) {
			continue;
		}

		$gql_type = ucfirst( $pt_obj->graphql_single_name );

		// Campos escalares
		foreach ( (array) ( $field_groups['scalar'] ?? [] ) as $meta_key ) {
			if ( empty( $meta_key ) ) continue;
			register_graphql_field( $gql_type, csb_to_camel( $meta_key ), [
				'type'        => 'String',
				'description' => "[JetEngine scalar] {$meta_key}",
				'resolve'     => csb_scalar_resolver( $meta_key ),
			] );
		}

		// Repeaters -> JSON string
		foreach ( (array) ( $field_groups['repeater'] ?? [] ) as $meta_key ) {
			if ( empty( $meta_key ) ) continue;
			register_graphql_field( $gql_type, csb_to_camel( $meta_key ), [
				'type'        => 'String',
				'description' => "[JetEngine repeater->JSON] {$meta_key}",
				'resolve'     => csb_repeater_resolver( $meta_key ),
			] );
		}
	}
}


// ======================================================
// BLOQUE 2.5 - REGISTRAR OPTIONS PAGES EN WPGRAPHQL
// Lee bridge-fields.json["_options"] y por cada page expone
// un tipo GraphQL nuevo y un campo en RootQuery.
// Los valores se leen de wp_options (no post_meta).
// ======================================================

add_action( 'graphql_register_types', 'csb_register_options_pages_from_config' );

function csb_register_options_pages_from_config(): void {
	$config = csb_load_fields_config();

	if ( empty( $config['_options'] ) || ! is_array( $config['_options'] ) ) {
		return;
	}

	foreach ( $config['_options'] as $page_slug => $field_groups ) {
		if ( empty( $page_slug ) || ! is_array( $field_groups ) ) {
			continue;
		}

		$gql_field = csb_to_camel( $page_slug );
		$gql_type  = ucfirst( $gql_field );

		$scalars   = (array) ( $field_groups['scalar']   ?? [] );
		$repeaters = (array) ( $field_groups['repeater'] ?? [] );

		$type_fields = [];

		foreach ( $scalars as $meta_key ) {
			if ( empty( $meta_key ) ) continue;
			$type_fields[ csb_to_camel( $meta_key ) ] = [
				'type'        => 'String',
				'description' => "[Options scalar] {$meta_key}",
				'resolve'     => csb_options_scalar_resolver( $page_slug, $meta_key ),
			];
		}

		foreach ( $repeaters as $meta_key ) {
			if ( empty( $meta_key ) ) continue;
			$type_fields[ csb_to_camel( $meta_key ) ] = [
				'type'        => 'String',
				'description' => "[Options repeater->JSON] {$meta_key}",
				'resolve'     => csb_options_repeater_resolver( $page_slug, $meta_key ),
			];
		}

		if ( empty( $type_fields ) ) {
			continue;
		}

		register_graphql_object_type( $gql_type, [
			'description' => "[Options Page] {$page_slug}",
			'fields'      => $type_fields,
		] );

		register_graphql_field( 'RootQuery', $gql_field, [
			'type'        => $gql_type,
			'description' => "Options Page: {$page_slug}",
			'resolve'     => static function () use ( $page_slug ) {
				// Source vacio: cada resolver de campo lee wp_options con su propia logica.
				return [ '_page_slug' => $page_slug ];
			},
		] );
	}
}

/**
 * Resuelve un campo escalar de una Options Page leyendo de wp_options.
 * Soporta tres patrones de almacenamiento que usa JetEngine:
 *   1) get_option($page_slug) retorna un array [field => value]
 *   2) get_option($page_slug . '_' . $field) retorna el valor suelto
 *   3) get_option($field) retorna el valor suelto sin prefijo
 */
function csb_options_scalar_resolver( string $page_slug, string $meta_key ): Closure {
	return static function () use ( $page_slug, $meta_key ): ?string {
		$value = csb_options_read_value( $page_slug, $meta_key );
		if ( $value === '' || $value === null || $value === false ) {
			return null;
		}
		return is_scalar( $value ) ? (string) $value : null;
	};
}

function csb_options_repeater_resolver( string $page_slug, string $meta_key ): Closure {
	return static function () use ( $page_slug, $meta_key ): ?string {
		$value = csb_options_read_value( $page_slug, $meta_key );
		if ( empty( $value ) ) {
			return null;
		}
		if ( is_array( $value ) ) {
			return wp_json_encode( $value ) ?: null;
		}
		if ( is_string( $value ) ) {
			// JetEngine a veces guarda el repeater ya serializado como JSON string.
			return $value;
		}
		return null;
	};
}

/**
 * Lee un campo de una Options Page intentando los 3 patrones de JetEngine.
 * Devuelve null si ningun patron tiene un valor presente.
 *
 * @return mixed
 */
function csb_options_read_value( string $page_slug, string $meta_key ) {
	// Patron 1: array bajo un solo option_name == page_slug
	$page_data = get_option( $page_slug );
	if ( is_array( $page_data ) && array_key_exists( $meta_key, $page_data ) ) {
		return $page_data[ $meta_key ];
	}

	// Patron 2: opcion individual con prefijo "<page_slug>_<field>"
	$prefixed = get_option( $page_slug . '_' . $meta_key, null );
	if ( $prefixed !== null && $prefixed !== false ) {
		return $prefixed;
	}

	// Patron 3: opcion suelta con el meta_key directamente
	$loose = get_option( $meta_key, null );
	if ( $loose !== null && $loose !== false ) {
		return $loose;
	}

	return null;
}


// ======================================================
// BLOQUE 3 - CARGA DE CONFIGURACION
// ======================================================

/**
 * Lee bridge-fields.json desde el directorio del plugin.
 * Retorna array vacio si no existe o es invalido.
 *
 * @return array<string, array{scalar: string[], repeater: string[]}>
 */
function csb_load_fields_config(): array {
	static $cache = null;

	if ( $cache !== null ) {
		return $cache;
	}

	if ( ! file_exists( CSB_FIELDS_FILE ) ) {
		$cache = [];
		return $cache;
	}

	$raw = file_get_contents( CSB_FIELDS_FILE );
	if ( ! $raw ) {
		$cache = [];
		return $cache;
	}

	$decoded = json_decode( $raw, true );
	$cache   = is_array( $decoded ) ? $decoded : [];

	return $cache;
}

/**
 * Escanea post_meta de posts existentes para sugerir campos.
 * Excluye claves internas de WordPress (empiezan con _).
 *
 * @return array<string, string[]>  [ post_type => [ meta_key, ... ] ]
 */
function csb_scan_existing_meta(): array {
	$excluded     = unserialize( CSB_EXCLUDED_TYPES );
	$all_pt       = get_post_types( [ 'public' => true ], 'names' );
	$custom_types = array_diff( $all_pt, $excluded );

	$result = [];

	foreach ( $custom_types as $pt ) {
		$posts = get_posts( [
			'post_type'      => $pt,
			'posts_per_page' => 3,
			'post_status'    => 'any',
			'no_found_rows'  => true,
		] );

		if ( empty( $posts ) ) {
			continue;
		}

		$keys = [];
		foreach ( $posts as $post ) {
			$meta  = get_post_meta( $post->ID );
			$found = array_filter(
				array_keys( $meta ),
				fn( $k ) => strpos( $k, '_' ) !== 0
			);
			$keys = array_unique( array_merge( $keys, $found ) );
		}

		if ( ! empty( $keys ) ) {
			sort( $keys );
			$result[ $pt ] = array_values( $keys );
		}
	}

	return $result;
}


// ======================================================
// BLOQUE 4 - RESOLVERS
// ======================================================

function csb_scalar_resolver( string $meta_key ): Closure {
	return static function ( $post ) use ( $meta_key ): ?string {
		$value = get_post_meta( $post->databaseId, $meta_key, true );
		if ( $value === '' || $value === false || $value === null ) {
			return null;
		}
		return is_scalar( $value ) ? (string) $value : null;
	};
}

function csb_repeater_resolver( string $meta_key ): Closure {
	return static function ( $post ) use ( $meta_key ): ?string {
		$value = get_post_meta( $post->databaseId, $meta_key, true );
		if ( empty( $value ) ) {
			return null;
		}
		if ( is_array( $value ) ) {
			return wp_json_encode( $value ) ?: null;
		}
		return is_string( $value ) ? $value : null;
	};
}


// ======================================================
// BLOQUE 5 - UTILIDADES
// ======================================================

/** "Proyectos Destacados" -> "proyectosDestacados" | "home-singleton" -> "homeSingleton" */
function csb_to_graphql_name( string $label ): string {
	$label = strtolower( trim( $label ) );
	$label = preg_replace( '/[^a-z0-9\s_\-]/', '', $label );
	$parts = array_values( array_filter( (array) preg_split( '/[\s_\-]+/', $label ) ) );
	if ( empty( $parts ) ) return 'cpt';
	$first = array_shift( $parts );
	return $first . implode( '', array_map( 'ucfirst', $parts ) );
}

/** "video_poster" -> "videoPoster" | "hero-title" -> "heroTitle" */
function csb_to_camel( string $meta_key ): string {
	$parts = array_values( array_filter( (array) preg_split( '/[_\-]+/', strtolower( $meta_key ) ) ) );
	if ( empty( $parts ) ) return $meta_key;
	$first = array_shift( $parts );
	return $first . implode( '', array_map( 'ucfirst', $parts ) );
}


// ======================================================
// BLOQUE 6 - PANEL DE ADMIN
// Settings -> WPGraphQL Bridge
// ======================================================

add_action( 'admin_menu', 'csb_add_menu' );

function csb_add_menu(): void {
	add_options_page( 'WPGraphQL Auto-Bridge', 'WPGraphQL Bridge', 'manage_options', 'csb-status', 'csb_admin_page' );
}

function csb_admin_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) return;

	$excluded    = unserialize( CSB_EXCLUDED_TYPES );
	$all_pt      = get_post_types( [], 'objects' );
	$custom_pt   = array_filter( $all_pt, fn( $pt ) => ! in_array( $pt->name, $excluded, true ) && ( $pt->public || $pt->show_ui ) );
	$config      = csb_load_fields_config();
	$scanned     = csb_scan_existing_meta();
	$config_ok   = file_exists( CSB_FIELDS_FILE );
	?>
	<div class="wrap">
		<h1>WPGraphQL Auto-Bridge <small style="font-size:14px;color:#888">v<?php echo esc_html( CSB_VERSION ); ?></small></h1>

		<?php // ── ESTADO GENERAL ── ?>
		<table class="widefat" style="max-width:600px;margin-bottom:2rem">
			<tbody>
				<tr>
					<td><strong>bridge-fields.json</strong></td>
					<td>
						<?php if ( $config_ok ) : ?>
							<span style="color:green">Encontrado</span> &mdash; <code><?php echo esc_html( CSB_FIELDS_FILE ); ?></code>
						<?php else : ?>
							<span style="color:red">No encontrado</span> &mdash; los meta fields no se registraran hasta que lo crees.
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<td><strong>CPTs detectados</strong></td>
					<td><?php echo count( $custom_pt ); ?> CPT(s) no-default encontrados</td>
				</tr>
			</tbody>
		</table>

		<?php // ── CPTs ── ?>
		<h2>CPTs expuestos a WPGraphQL</h2>
		<?php if ( empty( $custom_pt ) ) : ?>
			<p>No se encontraron CPTs personalizados. Verifica que JetEngine este activo y tenga CPTs registrados.</p>
		<?php else : ?>
			<table class="widefat striped" style="max-width:900px">
				<thead><tr>
					<th>Post Type Slug</th><th>GraphQL Single</th><th>GraphQL Plural</th><th>Estado</th>
				</tr></thead>
				<tbody>
				<?php foreach ( $custom_pt as $pt ) :
					$exposed     = ! empty( $pt->graphql_single_name );
					$real_single = $pt->graphql_single_name ?? '—';
					$real_plural = $pt->graphql_plural_name  ?? '—';
					?>
					<tr>
						<td><code><?php echo esc_html( $pt->name ); ?></code></td>
						<td><code><?php echo esc_html( $real_single ); ?></code></td>
						<td><code><?php echo esc_html( $real_plural ); ?></code></td>
						<td>
							<?php if ( $exposed ) : ?>
								<span style="color:green">Expuesto</span> &mdash; tipo GraphQL: <code><?php echo esc_html( ucfirst( $real_single ) ); ?></code>
							<?php else : ?>
								<span style="color:orange">Pendiente</span> &mdash; se activara en el proximo request
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<?php // ── META FIELDS CONFIGURADOS ── ?>
		<h2 style="margin-top:2rem">Meta fields configurados <small style="font-weight:normal;font-size:13px">(bridge-fields.json)</small></h2>
		<?php if ( ! $config_ok ) : ?>
			<div class="notice notice-warning inline" style="margin:0">
				<p><strong>bridge-fields.json no existe.</strong> Crea el archivo en <code><?php echo esc_html( CSB_FIELDS_FILE ); ?></code> con la estructura de abajo.</p>
			</div>
		<?php elseif ( empty( $config ) ) : ?>
			<p>El archivo existe pero esta vacio o tiene formato invalido.</p>
		<?php else : ?>
			<?php foreach ( $config as $pt => $groups ) :
				if ( strpos( (string) $pt, '_' ) === 0 ) continue; // skip meta-config (_options, etc.)
				$pt_obj   = get_post_type_object( $pt );
				$gql_type = $pt_obj ? ucfirst( $pt_obj->graphql_single_name ?? '' ) : '(no expuesto)';
				$scalars  = (array) ( $groups['scalar']  ?? [] );
				$repeaters = (array) ( $groups['repeater'] ?? [] );
				?>
				<h3><code><?php echo esc_html( $pt ); ?></code> &rarr; tipo GraphQL <code><?php echo esc_html( $gql_type ); ?></code></h3>
				<table class="widefat striped" style="max-width:700px;margin-bottom:1rem">
					<thead><tr><th>meta_key</th><th>GraphQL field</th><th>Tipo</th></tr></thead>
					<tbody>
					<?php foreach ( array_merge( array_fill_keys( $scalars, 'scalar' ), array_fill_keys( $repeaters, 'repeater' ) ) as $mk => $type ) : ?>
						<tr>
							<td><code><?php echo esc_html( $mk ); ?></code></td>
							<td><code><?php echo esc_html( csb_to_camel( $mk ) ); ?></code></td>
							<td><?php echo $type === 'repeater' ? 'repeater &rarr; JSON' : 'scalar'; ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endforeach; ?>
		<?php endif; ?>

		<?php // ── OPTIONS PAGES ── ?>
		<?php $options_config = (array) ( $config['_options'] ?? [] ); ?>
		<?php if ( ! empty( $options_config ) ) : ?>
			<h2 style="margin-top:2rem">Options Pages expuestas <small style="font-weight:normal;font-size:13px">(bridge-fields.json &rarr; _options)</small></h2>
			<?php foreach ( $options_config as $page_slug => $groups ) :
				$gql_field = csb_to_camel( (string) $page_slug );
				$gql_type  = ucfirst( $gql_field );
				$scalars   = (array) ( $groups['scalar']   ?? [] );
				$repeaters = (array) ( $groups['repeater'] ?? [] );
				$all       = array_merge(
					array_fill_keys( $scalars,   'scalar' ),
					array_fill_keys( $repeaters, 'repeater' )
				);
				$probe     = csb_options_read_value( (string) $page_slug, (string) ( array_key_first( $all ) ?? '' ) );
				?>
				<h3><code><?php echo esc_html( $page_slug ); ?></code> &rarr; query <code><?php echo esc_html( $gql_field ); ?></code> · tipo <code><?php echo esc_html( $gql_type ); ?></code></h3>
				<p style="color:#666;font-size:12px">
					<?php if ( $probe !== null ) : ?>
						<span style="color:green">Valores detectados</span> en <code>wp_options</code> con uno de los 3 patrones soportados.
					<?php else : ?>
						<span style="color:orange">Sin valores detectados</span> aun. Llena los campos en la Options Page de JetEngine y guarda.
					<?php endif; ?>
				</p>
				<table class="widefat striped" style="max-width:700px;margin-bottom:1rem">
					<thead><tr><th>option key</th><th>GraphQL field</th><th>Tipo</th></tr></thead>
					<tbody>
					<?php foreach ( $all as $mk => $type ) : ?>
						<tr>
							<td><code><?php echo esc_html( $mk ); ?></code></td>
							<td><code><?php echo esc_html( csb_to_camel( $mk ) ); ?></code></td>
							<td><?php echo $type === 'repeater' ? 'repeater &rarr; JSON' : 'scalar'; ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endforeach; ?>
		<?php endif; ?>

		<?php // ── CAMPOS SUGERIDOS DESDE POSTS EXISTENTES ── ?>
		<h2 style="margin-top:2rem">Campos sugeridos desde posts existentes</h2>
		<?php if ( empty( $scanned ) ) : ?>
			<p>No se encontraron posts con meta fields publicos. Crea al menos un post en cada CPT y llena sus campos para que aparezcan aqui.</p>
		<?php else : ?>
			<p>Estos campos fueron encontrados en posts existentes. Usaelos para completar <code>bridge-fields.json</code>.</p>
			<?php foreach ( $scanned as $pt => $keys ) : ?>
				<h3><code><?php echo esc_html( $pt ); ?></code></h3>
				<p style="font-family:monospace;background:#f0f0f0;padding:12px;max-width:700px">
					<?php echo esc_html( implode( ', ', $keys ) ); ?>
				</p>
			<?php endforeach; ?>
		<?php endif; ?>

		<?php // ── GENERADOR DE bridge-fields.json ── ?>
		<h2 style="margin-top:2rem">Generar bridge-fields.json</h2>
		<p>Copia este JSON, pegalo en un archivo llamado <code>bridge-fields.json</code> en la misma carpeta del plugin, y ajusta los campos segun tu proyecto:</p>
		<pre style="background:#1e1e1e;color:#d4d4d4;padding:20px;max-width:700px;overflow:auto;font-size:13px;border-radius:4px"><?php
			echo esc_html( csb_generate_config_template( $scanned ) );
		?></pre>

		<?php // ── QUERY DE VERIFICACION ── ?>
		<?php if ( ! empty( $config ) ) : ?>
			<h2 style="margin-top:2rem">Query de verificacion</h2>
			<pre style="background:#f0f0f0;padding:16px;max-width:700px;overflow:auto;font-size:13px"><?php
				echo esc_html( csb_generate_test_query( $config, $custom_pt ) );
			?></pre>
		<?php endif; ?>

	</div>
	<?php
}

function csb_generate_config_template( array $scanned ): string {
	if ( empty( $scanned ) ) {
		return json_encode( [
			'your-post-type-slug' => [
				'scalar'   => [ 'field_name_1', 'field_name_2' ],
				'repeater' => [ 'repeater_field_name' ],
			],
		], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
	}

	$template = [];
	foreach ( $scanned as $pt => $keys ) {
		$template[ $pt ] = [
			'scalar'   => $keys,
			'repeater' => [],
		];
	}

	return json_encode( $template, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );
}

function csb_generate_test_query( array $config, array $custom_pt ): string {
	$query = "{\n";
	foreach ( $custom_pt as $pt ) {
		$plural = $pt->graphql_plural_name ?? csb_to_graphql_name( $pt->name . 's' );
		$query .= "  {$plural} {\n    nodes {\n      id\n      title\n";
		if ( ! empty( $config[ $pt->name ] ) ) {
			$all_fields = array_merge(
				(array) ( $config[ $pt->name ]['scalar']   ?? [] ),
				(array) ( $config[ $pt->name ]['repeater'] ?? [] )
			);
			foreach ( array_slice( $all_fields, 0, 3 ) as $mk ) {
				$query .= '      ' . csb_to_camel( $mk ) . "\n";
			}
		}
		$query .= "    }\n  }\n";
	}

	// Options Pages
	foreach ( (array) ( $config['_options'] ?? [] ) as $page_slug => $groups ) {
		$gql_field  = csb_to_camel( (string) $page_slug );
		$all_fields = array_merge(
			(array) ( $groups['scalar']   ?? [] ),
			(array) ( $groups['repeater'] ?? [] )
		);
		$query .= "  {$gql_field} {\n";
		foreach ( array_slice( $all_fields, 0, 3 ) as $mk ) {
			$query .= '    ' . csb_to_camel( $mk ) . "\n";
		}
		$query .= "  }\n";
	}

	return $query . '}';
}

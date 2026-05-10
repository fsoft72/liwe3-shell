const fs = require( 'fs' );
const path = require( 'path' );

const MCP_CATALOG_FILE = path.join( __dirname, 'mcp_catalog.json' );
const LOCAL_MCP_FILE = '.mcp.json';

/**
 * Loads the built-in MCP catalog.
 * @returns {Object} catalog entries keyed by name
 */
const _loadCatalog = () => {
	return JSON.parse( fs.readFileSync( MCP_CATALOG_FILE, 'utf8' ) );
};

/**
 * Loads the local .mcp.json or returns empty structure.
 * @returns {Object}
 */
const _loadLocal = () => {
	if ( !fs.existsSync( LOCAL_MCP_FILE ) ) return { mcpServers: {} };
	return JSON.parse( fs.readFileSync( LOCAL_MCP_FILE, 'utf8' ) );
};

/**
 * Saves the local .mcp.json.
 * @param {Object} data
 */
const _saveLocal = ( data ) => {
	fs.writeFileSync( LOCAL_MCP_FILE, JSON.stringify( data, null, 2 ) + '\n' );
};

/**
 * Extracts env var references from a JSON-serialized string.
 * Matches ${VAR} and ${VAR||default} patterns.
 *
 * @param {string} str
 * @returns {Array<{name: string, hasDefault: boolean, defaultValue: string|null}>}
 */
const _extractEnvVars = ( str ) => {
	const vars = [];
	const regex = /\$\{([A-Z0-9_]+)(?:\|\|([^}]*))?\}/g;
	let match;

	while ( ( match = regex.exec( str ) ) !== null ) {
		vars.push( {
			name: match[ 1 ],
			hasDefault: match[ 2 ] !== undefined,
			defaultValue: match[ 2 ] || null,
		} );
	}

	return vars;
};

/**
 * Lists all MCPs available in the built-in catalog.
 */
const mcpCatalog = () => {
	const catalog = _loadCatalog();
	const names = Object.keys( catalog );

	if ( names.length === 0 ) {
		console.log( 'No MCPs in catalog.' );
		return;
	}

	console.log( 'Available MCPs:\n' );

	for ( const name of names ) {
		const entry = catalog[ name ];
		const envVars = _extractEnvVars( JSON.stringify( entry ) );
		const type = entry.type || 'stdio';

		let line = `  ${ name } (${ type })`;

		if ( envVars.length > 0 ) {
			const envInfo = envVars.map( v => v.hasDefault ? `${ v.name }=${ v.defaultValue }` : v.name ).join( ', ' );
			line += ` [env: ${ envInfo }]`;
		}

		console.log( line );
	}
};

/**
 * Adds an MCP from the catalog to the local .mcp.json.
 * Warns if the MCP requires environment variables.
 *
 * @param {string} name - MCP name from catalog
 */
const mcpAdd = ( name ) => {
	if ( !name ) {
		console.log( 'ERROR: provide an MCP name. Run "mcp catalog" to list available MCPs.' );
		return;
	}

	const catalog = _loadCatalog();

	if ( !catalog[ name ] ) {
		console.log( `ERROR: '${ name }' not found in catalog. Run "mcp catalog" to list available MCPs.` );
		return;
	}

	const local = _loadLocal();
	const isUpdate = !!local.mcpServers[ name ];

	local.mcpServers[ name ] = catalog[ name ];
	_saveLocal( local );

	const action = isUpdate ? 'updated' : 'added';
	console.log( `MCP '${ name }' ${ action } in ${ LOCAL_MCP_FILE }.` );

	const envVars = _extractEnvVars( JSON.stringify( catalog[ name ] ) );

	if ( envVars.length > 0 ) {
		console.log( '\nWARNING: this MCP requires environment variables to be set:' );

		for ( const v of envVars ) {
			if ( v.hasDefault ) {
				console.log( `  ${ v.name } (default: ${ v.defaultValue })` );
			} else {
				console.log( `  ${ v.name } (REQUIRED — no default)` );
			}
		}

		console.log( '\nSet them in your shell environment or in the MCP server configuration before use.' );
	}
};

/**
 * Lists all MCPs configured in the local .mcp.json.
 */
const mcpList = () => {
	const local = _loadLocal();
	const names = Object.keys( local.mcpServers || {} );

	if ( names.length === 0 ) {
		console.log( `No MCPs configured in ${ LOCAL_MCP_FILE }.` );
		return;
	}

	console.log( `MCPs in ${ LOCAL_MCP_FILE }:\n` );

	for ( const name of names ) {
		const entry = local.mcpServers[ name ];
		const type = entry.type || 'stdio';
		console.log( `  ${ name } (${ type })` );
	}
};

/**
 * Removes an MCP from the local .mcp.json.
 * @param {string} name - MCP name to remove
 */
const mcpDel = ( name ) => {
	if ( !name ) {
		console.log( 'ERROR: provide an MCP name. Run "mcp list" to see configured MCPs.' );
		return;
	}

	const local = _loadLocal();

	if ( !local.mcpServers[ name ] ) {
		console.log( `ERROR: '${ name }' not found in ${ LOCAL_MCP_FILE }.` );
		return;
	}

	delete local.mcpServers[ name ];
	_saveLocal( local );

	console.log( `MCP '${ name }' removed from ${ LOCAL_MCP_FILE }.` );
};

module.exports = { mcpCatalog, mcpAdd, mcpList, mcpDel };

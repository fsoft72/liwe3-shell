const { addDependencies, checkGit, gitAddSubmodule } = require( './utils' );
const { maid, layout, config } = require( './svelte_files' );
const { execSync } = require( 'child_process' );
const fs = require( 'fs' );

const _addDeps = ( pm ) => {
	const deps = [
		[ "@types/chroma-js", true ],
		[ "chroma-js", true ],
		[ "marked", true ],
		[ "svelte-check", true ],
		[ "svelte-dnd-action", true ],
		[ "svelte-hero-icons", true ],
		[ "svelte-markdown", true ],
		[ "svelte-select", true ],
		[ "svelvet", true ]
	];

	// add dependencies to the project
	console.log( '  - Adding dependencies...' );

	// group dependencies by dev and non-dev
	let devDeps = deps.filter( ( dep ) => dep[ 1 ] );
	let nonDevDeps = deps.filter( ( dep ) => !dep[ 1 ] );

	// add dependencies
	if ( nonDevDeps.length ) addDependencies( pm, nonDevDeps.map( ( dep ) => dep[ 0 ] ) );
	if ( devDeps.length ) addDependencies( pm, devDeps.map( ( dep ) => dep[ 0 ] ), true );
};

const _addSubmodules = ( pm ) => {
	process.chdir( 'src' );

	// add liwe3 submodule to the project (if not already added)
	if ( !fs.existsSync( 'liwe3' ) ) {
		console.log( '  - Adding LiWE3 submodule...' );

		gitAddSubmodule( 'git@github.com:fsoft72/liwe3-svelte', 'liwe3' );
	}

	// add modules to the project
	if ( !fs.existsSync( 'modules' ) ) {
		console.log( "  - Creating modules folder..." );
		fs.mkdirSync( 'modules' );
	};

	process.chdir( 'modules' );

	const modules = [ 'mediamanager', 'system', 'tag', 'theme', 'user' ];
	modules.forEach( ( module ) => {
		gitAddSubmodule( `git@github.com:fsoft72/svelte-mod-${ module }`, module );
	} );

	process.chdir( '../..' );
};

const _createEnv = ( nodeServerPort ) => {
	// create .env file
	if ( !fs.existsSync( '.env' ) ) {
		console.log( '  - Creating .env file...' );
		fs.writeFileSync( '.env', `PUBLIC_LIWE_SERVER=http://localhost:${ nodeServerPort }\n` );
	}
};

const _createMaid = () => {
	if ( !fs.existsSync( 'maid.json' ) ) {
		console.log( '  - Creating maid.json file...' );
		fs.writeFileSync( 'maid.json', maid );
	}
};

const _createLayout = () => {
	if ( !fs.existsSync( 'src/routes/+layout.svelte' ) ) {
		console.log( '  - Creating basic layout file...' );
		fs.writeFileSync( 'src/routes/+layout.svelte', layout );
	}
};

const _config = () => {
	// check if svelte.config.js contains the $modules variable
	let svelteConfig = fs.readFileSync( 'svelte.config.js' ).toString();
	if ( svelteConfig.includes( '$modules' ) ) return;

	console.log( '  - Creating svelte.config.js file...' );
	fs.writeFileSync( 'svelte.config.js', config );
};

const svelteInit = ( pm, nodeServerPort ) => {
	console.log( 'Initializing LiWE3 Svelte project...' );

	if ( !checkGit( true ) ) {
		console.log( '\n\nERROR: git is not initialized.\nPlease run "git init" first.\n' );
		console.log( 'then run "npx liwe3 svelte init" again inside the project directory.\n' );
		return;
	}

	_addDeps( pm );
	_addSubmodules( pm );
	_createEnv( nodeServerPort );
	_createMaid();
	_createLayout();
	_config();
};

const svelteCreateProject = ( projectName, pm, nodeServerPort ) => {
	console.log( `Creating LiWE3 Svelte project ${ projectName }...` );

	if ( fs.existsSync( projectName ) ) {
		console.log( `ERROR: ${ projectName } already exists.` );
		return;
	}

	execSync( `npx sv create ${ projectName }`, { stdio: 'inherit' } );
	process.chdir( projectName );
	svelteInit( pm, nodeServerPort );
};

module.exports = {
	svelteInit,
	svelteCreateProject
};
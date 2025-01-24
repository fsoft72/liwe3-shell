#!/usr/bin/env node

const fs = require( 'fs' );
const { execSync } = require( 'child_process' );
const yargs = require( 'yargs/yargs' );
const { hideBin } = require( 'yargs/helpers' );
const liwe3Data = require( './data' );

const checkIsSvelte = () => {
	// if package.json does not exist, return false
	if ( !fs.existsSync( 'package.json' ) ) return false;

	// Open package.json and check if svelte is installed
	const packageJson = JSON.parse( fs.readFileSync( 'package.json' ) );
	return ( packageJson.devDependencies?.svelte || packageJson.dependencies?.svelte ) ? true : false;
};

const resolvePackageManager = () => {
	// if package.json does not exist, return npm
	if ( !fs.existsSync( 'package.json' ) ) return 'npm';

	if ( fs.existsSync( 'yarn.lock' ) ) return 'yarn';
	if ( fs.existsSync( 'pnpm-lock.yaml' ) ) return 'pnpm';

	return 'npm';
};

const gitAddSubmodule = ( submodule, alias ) => {
	// console.log( `Adding submodule: ${ submodule }` );
	execSync( `git submodule add --quiet ${ submodule } ${ alias }`, { stdio: 'inherit' } );
};

const addDependencies = ( pm, deps, dev = false ) => {
	const cmd = `${ pm } add ${ deps.join( ' ' ) } ${ dev ? '--save-dev' : '' }`;
	// console.log( "=== CMD: ", cmd );
	execSync( cmd, { stdio: 'inherit' } );
};

const _svelteAddDepebdencies = ( pm ) => {
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

const _svelteAddSubmodules = ( pm ) => {
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
		if ( !fs.existsSync( module ) ) {
			console.log( `  - Adding ${ module } submodule...` );
			gitAddSubmodule( `git@github.com:fsoft72/svelte-mod-${ module }`, module );
		}
	} );

	process.chdir( '../..' );
};

const _svelteCreateEnv = ( nodeServerPort ) => {
	// create .env file
	if ( !fs.existsSync( '.env' ) ) {
		console.log( '  - Creating .env file...' );
		fs.writeFileSync( '.env', `PUBLIC_LIWE_SERVER=http://localhost:${ nodeServerPort }` );
	}
};

const _svelteCreateMaid = () => {

	if ( !fs.existsSync( 'maid.json' ) ) {
		console.log( '  - Creating maid.json file...' );
		fs.writeFileSync( 'maid.json', liwe3Data.svelte.maid );
	}
};

const _svelteCreateLayout = () => {
	if ( !fs.existsSync( 'src/routes/+layout.svelte' ) ) {
		console.log( '  - Creating basic layout file...' );
		fs.writeFileSync( 'src/routes/+layout.svelte', liwe3Data.svelte.layout );
	}
};

const _svelteConfig = () => {
	// check if svelte.config.js contains the $modules variable
	let svelteConfig = fs.readFileSync( 'svelte.config.js' ).toString();
	if ( svelteConfig.includes( '$modules' ) ) return;

	console.log( '  - Creating svelte.config.js file...' );
	fs.writeFileSync( 'svelte.config.js', liwe3Data.svelte.config );
};

const svelteInit = ( pm, nodeServerPort ) => {
	console.log( 'Initializing LiWE3 Svelte project...' );

	_svelteAddDepebdencies( pm );
	_svelteAddSubmodules( pm );
	_svelteCreateEnv( nodeServerPort );
	_svelteCreateMaid();
	_svelteCreateLayout();
	_svelteConfig();
};

const argv = yargs( hideBin( process.argv ) )
	.usage( 'Usage: $0 <command> [options]' )
	.command( 'init', 'Initialize project' )
	.command( 'addsubmodule [submodules..]', 'Add submodules to project', ( yargs ) => {
		return yargs.positional( 'submodules', {
			describe: 'List of submodules to add',
			type: 'string',
			array: true
		} );
	} )
	.option( 'node-server-port', {
		alias: 'p',
		type: 'number',
		description: 'Set Node server port',
		default: 12000
	} )
	.option( 'pm', {
		type: 'string',
		description: 'Set package manager',
		choices: [ 'npm', 'yarn', 'pnpm' ]
	} )
	.help()
	.argv;

console.log( '=== LIWE3' );

// get the package manager (default to npm)
argv.pm = argv.pm || resolvePackageManager();

let isSvelte = checkIsSvelte();


switch ( argv._[ 0 ] ) {
	case 'init':
		console.log( 'Initializing project...' );
		if ( argv.pm ) console.log( `Using package manager: ${ argv.pm }` );

		if ( isSvelte ) {
			console.log( 'Svelte project detected' );
			svelteInit( argv.pm, argv.nodeServerPort );
		}

		break;
	case 'addsubmodule':
		console.log( 'Adding submodules:', argv.submodules );
		break;
	default:
		console.log( `Mode: ${ argv.node ? 'Node' : 'Svelte' }` );
}
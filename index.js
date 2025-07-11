#!/usr/bin/env node

const VERSION = '0.5.0';

const fs = require( 'fs' );
const yargs = require( 'yargs/yargs' );
const { hideBin } = require( 'yargs/helpers' );

const {
	checkIsSvelte,
	resolvePackageManager,
	checkGit,
} = require( './data/utils' );

const {
	svelteInit,
	svelteCreateProject,
	svelteAddSubmodule,
} = require( './data/svelte_ops' );

const {
	nodeCreateProject,
	nodeAddSubmodule,
} = require( './data/nodejs_ops' );


const nodeInit = ( pm, nodeServerPort ) => {
	if ( !fs.existsSync( 'package.json' ) ) {
		console.log( "\n\nERROR: this does not seem to be a Node project.\n" );
		return;
	}
	console.log( 'Initializing LiWE3 Node project...' );

	if ( !checkGit() ) return;
};

const argv = yargs( hideBin( process.argv ) )
	.usage( 'Usage: $0 <command> [options]' )

	.command( 'init', 'Initialize project' )
	.command( 'create <type> <name>', 'Create new project', ( yargs ) => {
		return yargs
			.positional( 'type', {
				describe: 'Project type (nodejs or svelte)',
				type: 'string',
				choices: [ 'nodejs', 'svelte' ]
			} )
			.positional( 'name', {
				describe: 'Project name',
				type: 'string'
			} );
	} )
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
		choices: [ 'npm', 'yarn', 'pnpm' ],
		default: 'pnpm'
	} )
	.version( VERSION )
	.help()
	.argv;

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
		} else {
			console.log( 'Node project detected' );
			nodeInit( argv.pm, argv.nodeServerPort );
		}

		break;
	case 'addsubmodule':
		console.log( 'Adding submodules:', argv.submodules );
		if ( isSvelte ) {
			console.log( 'Svelte project detected' );
			svelteAddSubmodule( argv.submodules );
		} else {
			console.log( 'Node project detected' );
			nodeAddSubmodule( argv.submodules );
		}
		break;
	case 'create':
		console.log( `Creating ${ argv.type } project: ${ argv.name }` );
		if ( argv.type == 'nodejs' )
			nodeCreateProject( argv.name, argv.pm, argv.nodeServerPort );
		else if ( argv.type == 'svelte' )
			svelteCreateProject( argv.name, argv.pm, argv.nodeServerPort );
		break;
	default:
		console.log( `Mode: ${ argv.node ? 'Node' : 'Svelte' }` );
}
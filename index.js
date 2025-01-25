#!/usr/bin/env node

const fs = require( 'fs' );
const yargs = require( 'yargs/yargs' );
const { hideBin } = require( 'yargs/helpers' );

const {
	checkIsSvelte,
	resolvePackageManager,
	checkGit,
} = require( './data/utils' );

const {
	svelteInit
} = require( './data/svelte_ops' );


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
		break;
	default:
		console.log( `Mode: ${ argv.node ? 'Node' : 'Svelte' }` );
}
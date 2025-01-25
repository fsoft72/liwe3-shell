const fs = require( 'fs' );
const { execSync } = require( 'child_process' );

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

// checks if the project has git initialized
const checkGit = () => {
	try {
		execSync( 'git status', { stdio: 'ignore' } );
		return true;
	} catch ( e ) {
		console.log( '\n\nERROR: git is not initialized. Please run "git init" first.\n' );
		return false;
	}
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




module.exports = {
	checkIsSvelte,
	resolvePackageManager,
	checkGit,
	gitAddSubmodule,
	addDependencies
};
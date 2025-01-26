const fs = require( 'fs' );
const { execSync } = require( 'child_process' );
const { pm_add_deps } = require( './pm_actions' );

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
const checkGit = ( suppressError = false ) => {
	try {
		execSync( 'git status', { stdio: 'ignore' } );
		return true;
	} catch ( e ) {
		if ( !suppressError ) console.log( '\n\nERROR: git is not initialized. Please run "git init" first.\n' );
		return false;
	}
};

const gitAddSubmodule = ( submodule, alias ) => {
	console.log( "  - Adding submodule: ", alias );
	if ( fs.existsSync( alias ) ) {
		console.log( `Submodule ${ alias } already exists. Skipping it.` );
		return;
	}

	// console.log( `Adding submodule: ${ submodule }` );
	execSync( `git submodule add --quiet ${ submodule } ${ alias }`, { stdio: 'inherit' } );
};

const addDependencies = ( pm, deps, dev = false ) => {
	pm_add_deps( pm, deps, dev );
};

const createFile = ( path, content, overwrite = false, backup = false ) => {
	if ( !overwrite && fs.existsSync( path ) ) return;

	if ( backup && fs.existsSync( path ) ) {
		fs.renameSync( path, `${ path }.orig` );
	}

	fs.writeFileSync( path, content );
};

const replacePlaceholders = ( content, dct ) => {
	// first of all, extract all placeholders from content
	// placeholders are strings enclosed in %% (e.g. %%PORT%%)
	const placeholders = content.match( /%%(.*?)%%/g );
	if ( !placeholders ) return content;

	// then check if all placeholders are in dct
	let error = false;
	placeholders.forEach( ( placeholder ) => {
		if ( error ) return;
		const key = placeholder.replace( /%/g, '' );
		if ( !( key in dct ) ) {
			error = true;
			console.log( `ERROR: Placeholder ${ key } not found in dictionary.` );
			return null;
		}
	} );

	if ( error ) return null;

	// replace all placeholders in content
	placeholders.forEach( ( placeholder ) => {
		const key = placeholder.replace( /%/g, '' );
		content = content.replace( placeholder, dct[ key ] );
	} );

	return content;
};

const generateRandomString = ( length ) => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for ( let i = 0; i < length; i++ ) {
		result += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}
	return result;
};



module.exports = {
	checkIsSvelte,
	createFile,
	resolvePackageManager,
	checkGit,
	gitAddSubmodule,
	addDependencies,
	replacePlaceholders,
	generateRandomString
};
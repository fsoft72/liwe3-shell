const fs = require( 'fs' );
const { execSync } = require( 'child_process' );

const LIWE3_CF_REMOTE = 'liwe3cf';
const LIWE3_CF_REPO = 'git@github.com:fsoft72/cf-liwe3-ng';

/**
 * Creates a new LiWE3 Cloudflare project.
 * Sets up git, adds the liwe3-cloudflare remote and merges it into the current branch.
 *
 * @param {string} [folder] - Optional folder to create and initialize. If omitted, uses current dir (must be empty).
 * @param {string} appName - Name of the app.
 */
const cfCreate = ( folder, appName ) => {
	if ( folder ) {
		if ( fs.existsSync( folder ) ) {
			console.log( `ERROR: folder '${ folder }' already exists.` );
			return;
		}

		fs.mkdirSync( folder, { recursive: true } );
		process.chdir( folder );
	} else {
		const files = fs.readdirSync( '.' );
		if ( files.length > 0 ) {
			console.log( 'ERROR: current directory is not empty. Pass a folder name or run in an empty directory.' );
			return;
		}
	}

	console.log( 'Initializing LiWE3 Cloudflare project...' );

	execSync( 'git init', { stdio: 'inherit' } );
	execSync( `git remote add ${ LIWE3_CF_REMOTE } ${ LIWE3_CF_REPO }`, { stdio: 'inherit' } );
	execSync( `git fetch ${ LIWE3_CF_REMOTE }`, { stdio: 'inherit' } );
	execSync( `git merge --allow-unrelated-histories ${ LIWE3_CF_REMOTE }/master`, { stdio: 'inherit' } );

	const backendDir = 'app/backend';
	if ( fs.existsSync( backendDir ) ) {
		const devVarsExample = `${ backendDir }/.dev.vars.example`;
		const devVars = `${ backendDir }/.dev.vars`;
		if ( fs.existsSync( devVarsExample ) ) {
			fs.copyFileSync( devVarsExample, devVars );
			console.log( `Copied ${ devVarsExample } to ${ devVars }` );
		}

		const pkgExample = `${ backendDir }/package.json.example`;
		const pkg = `${ backendDir }/package.json`;
		if ( fs.existsSync( pkgExample ) ) {
			let content = fs.readFileSync( pkgExample, 'utf8' );
			content = content.replace( /APP_NAME/g, appName );
			fs.writeFileSync( pkg, content, 'utf8' );
			console.log( `Generated ${ pkg } with APP_NAME replaced by ${ appName }` );
		}

		const wranglerExample = `${ backendDir }/wrangler.jsonc.example`;
		const wrangler = `${ backendDir }/wrangler.jsonc`;
		if ( fs.existsSync( wranglerExample ) ) {
			let content = fs.readFileSync( wranglerExample, 'utf8' );
			content = content.replace( /APP_NAME/g, appName );
			fs.writeFileSync( wrangler, content, 'utf8' );
			console.log( `Generated ${ wrangler } with APP_NAME replaced by ${ appName }` );
		}
	}

	console.log( '\nLiWE3 Cloudflare project created.' );
};

/**
 * Checks that the current directory is a valid LiWE3 Cloudflare repo
 * (git initialized and liwe3cf remote present).
 *
 * @returns {boolean}
 */
const _checkIsLiwe3Repo = () => {
	try {
		execSync( 'git status', { stdio: 'ignore' } );
	} catch {
		console.log( 'ERROR: not inside a git repository.' );
		return false;
	}

	try {
		const remotes = execSync( 'git remote', { encoding: 'utf8' } );
		if ( !remotes.split( '\n' ).includes( LIWE3_CF_REMOTE ) ) {
			console.log( `ERROR: '${ LIWE3_CF_REMOTE }' remote not found. Not a LiWE3 Cloudflare repo.` );
			return false;
		}
	} catch {
		console.log( 'ERROR: could not read git remotes.' );
		return false;
	}

	return true;
};

/**
 * Fetches and merges latest changes from liwe3-cloudflare into the current branch.
 * Must be run inside a valid LiWE3 Cloudflare repo.
 */
const cfUpdate = () => {
	if ( !_checkIsLiwe3Repo() ) return;

	console.log( 'Updating LiWE3 Cloudflare project...' );

	execSync( `git fetch ${ LIWE3_CF_REMOTE }`, { stdio: 'inherit' } );
	execSync( `git merge ${ LIWE3_CF_REMOTE }/master`, { stdio: 'inherit' } );

	console.log( '\nLiWE3 Cloudflare project updated.' );
};

/**
 * Initializes a working LiWE3 Cloudflare repo (must already be created).
 * Runs tsconfig paths generation, installs dependencies and runs clean-setup.
 */
const cfInit = () => {
	if ( !_checkIsLiwe3Repo() ) return;

	console.log( 'Initializing LiWE3 Cloudflare project...' );

	execSync( './scripts/mk-tsconfig-paths.sh', { stdio: 'inherit' } );
	execSync( 'pnpm i', { stdio: 'inherit' } );
	execSync( 'pnpm clean-setup', { stdio: 'inherit' } );

	console.log( '\nLiWE3 Cloudflare project initialized.' );
};

module.exports = { cfCreate, cfInit, cfUpdate };

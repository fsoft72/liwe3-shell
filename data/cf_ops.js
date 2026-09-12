const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const LIWE3_CF_REMOTE = 'liwe3cf';
const LIWE3_CF_REPO_HTTPS = 'https://github.com/fsoft72/cf-liwe3-ng.git';
const LIWE3_CF_REPO_SSH = 'git@github.com:fsoft72/cf-liwe3-ng.git';
const LIWE3_CF_BRANCH = 'master';
const CONFIG_FILE = path.join( __dirname, 'liwe3-update.conf' );

/**
 * Parses the [skip] / [copy-if-missing] sections of the update config file.
 *
 * @returns {{ skip: string[], copyIfMissing: string[] }}
 */
const _parseConfig = () => {
	const skip = [];
	const copyIfMissing = [];
	let section = null;

	if ( !fs.existsSync( CONFIG_FILE ) ) {
		console.log( `ERROR: config file not found: ${ CONFIG_FILE }` );
		return { skip, copyIfMissing };
	}

	const lines = fs.readFileSync( CONFIG_FILE, 'utf8' ).split( '\n' );
	for ( let line of lines ) {
		const sectionMatch = line.trim().match( /^\[(.+)\]$/ );
		if ( sectionMatch ) {
			section = sectionMatch[ 1 ];
			continue;
		}

		line = line.replace( /#.*/, '' ).trim();
		if ( !line ) continue;

		if ( section === 'skip' ) skip.push( line );
		if ( section === 'copy-if-missing' ) copyIfMissing.push( line );
	}

	return { skip, copyIfMissing };
};

/**
 * Checks whether relPath matches one of the given patterns.
 * A pattern ending with "/" matches as a directory prefix, otherwise it must match exactly.
 *
 * @param {string} relPath
 * @param {string[]} patterns
 * @returns {boolean}
 */
const _matches = ( relPath, patterns ) => {
	return patterns.some( ( entry ) => {
		if ( entry.endsWith( '/' ) ) return relPath.startsWith( entry );
		return relPath === entry;
	} );
};

/**
 * Clones the cf-liwe3-ng repo (HTTPS first, SSH fallback) into a temporary directory.
 *
 * @returns {string} path to the cloned repo
 */
const _cloneSource = () => {
	const tmpDir = fs.mkdtempSync( path.join( os.tmpdir(), 'liwe3-cf-' ) );
	const src = path.join( tmpDir, 'repo' );

	console.log( `Cloning ${ LIWE3_CF_BRANCH } of cf-liwe3-ng into a temporary directory...` );

	try {
		execSync( `git clone --depth 1 --branch ${ LIWE3_CF_BRANCH } ${ LIWE3_CF_REPO_HTTPS } "${ src }"`, { stdio: 'ignore' } );
	} catch {
		console.log( 'HTTPS clone failed, trying SSH...' );
		execSync( `git clone --depth 1 --branch ${ LIWE3_CF_BRANCH } ${ LIWE3_CF_REPO_SSH } "${ src }"`, { stdio: 'inherit' } );
	}

	return src;
};

/**
 * Copies the tracked files of the cloned source repo into destDir, honouring
 * the [skip] and [copy-if-missing] rules declared in the config file.
 *
 * @param {string} src - path to the cloned source repo
 * @param {string} destDir - target directory
 * @returns {{ copied: number, skippedSkip: number, skippedExist: number }}
 */
const _copyTrackedFiles = ( src, destDir ) => {
	const { skip, copyIfMissing } = _parseConfig();

	const files = execSync( 'git ls-files', { cwd: src, encoding: 'utf8' } )
		.split( '\n' )
		.filter( Boolean );

	let copied = 0;
	let skippedSkip = 0;
	let skippedExist = 0;

	for ( const file of files ) {
		if ( skip.length && _matches( file, skip ) ) {
			skippedSkip++;
			continue;
		}

		const destPath = path.join( destDir, file );
		if ( copyIfMissing.length && _matches( file, copyIfMissing ) && fs.existsSync( destPath ) ) {
			skippedExist++;
			continue;
		}

		fs.mkdirSync( path.dirname( destPath ), { recursive: true } );
		fs.copyFileSync( path.join( src, file ), destPath );
		copied++;
	}

	console.log( `Copied:               ${ copied }` );
	console.log( `Skipped ([skip]):      ${ skippedSkip }` );
	console.log( `Skipped (already here): ${ skippedExist }` );

	return { copied, skippedSkip, skippedExist };
};

/**
 * Creates a new LiWE3 Cloudflare project by cloning cf-liwe3-ng and copying its
 * tracked files (honouring the [skip] / [copy-if-missing] rules) into the target folder.
 *
 * @param {string} [folder] - Optional folder to create and initialize. If omitted, uses current dir (must be empty).
 */
const cfCreate = ( folder ) => {
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

	const src = _cloneSource();
	try {
		_copyTrackedFiles( src, '.' );
	} finally {
		fs.rmSync( path.dirname( src ), { recursive: true, force: true } );
	}

	execSync( 'git init', { stdio: 'inherit' } );
	execSync( `git remote add ${ LIWE3_CF_REMOTE } ${ LIWE3_CF_REPO_HTTPS }`, { stdio: 'inherit' } );

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
 * Updates a LiWE3 Cloudflare project by cloning the latest cf-liwe3-ng and copying its
 * tracked files (honouring the [skip] / [copy-if-missing] rules) into the current repo.
 * Must be run inside a valid LiWE3 Cloudflare repo with a clean working tree.
 */
const cfUpdate = () => {
	if ( !_checkIsLiwe3Repo() ) return;

	if ( execSync( 'git status --porcelain', { encoding: 'utf8' } ).trim() ) {
		console.log( 'ERROR: working tree has uncommitted changes. Commit or stash them first.' );
		return;
	}

	console.log( 'Updating LiWE3 Cloudflare project...' );

	const src = _cloneSource();
	try {
		_copyTrackedFiles( src, '.' );
	} finally {
		fs.rmSync( path.dirname( src ), { recursive: true, force: true } );
	}

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

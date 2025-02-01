const fs = require( 'fs' );
const { execSync } = require( 'child_process' );
const { addDependencies, createFile, checkGit, gitAddSubmodule, replacePlaceholders, generateRandomString } = require( './utils' );

const nodeFiles = require( './nodejs_files' );

const _createFiles = () => {
	createFile( '.eslintignore', nodeFiles.eslintIgnore, true, true );
	createFile( '.eslintrc.js', nodeFiles.eslintRC, true, true );
	createFile( '.gitignore', nodeFiles.gitIgnore, true, true );
	createFile( 'tsconfig.json', nodeFiles.tsConfig, true, true );
};

const _createServer = () => {
	// create server directory
	if ( !fs.existsSync( 'server' ) ) {
		fs.mkdirSync( 'server' );
	}

	// create server/modules directory
	if ( !fs.existsSync( 'server/modules' ) ) {
		fs.mkdirSync( 'server/modules' );
	}

	// create server/server.ts
	createFile( 'server/server.ts', nodeFiles.server, true, true );
};

const _addSubmodules = ( pm ) => {
	process.chdir( 'server' );

	// first of all, check if the project is a git repo
	if ( !checkGit( true ) ) {
		process.chdir( '..' );
		execSync( 'git init', { stdio: 'inherit' } );
		process.chdir( 'server' );
	}

	// add liwe submodule to the project (if not already added)
	gitAddSubmodule( 'git@github.com:fsoft72/liwe3-nodejs.git', 'liwe' );

	process.chdir( 'modules' );

	modules = [ 'address', 'category', 'session', 'system', 'tag', 'mediamanager', 'user' ];
	modules.forEach( ( module ) => {
		gitAddSubmodule( `git@github.com:fsoft72/nodejs-mod-${ module }`, module );
	} );
};

const _createDataConfig = ( project_name, port ) => {
	const content = replacePlaceholders( nodeFiles.dataConfig, {
		'APP_NAME': project_name,
		'PORT': port,
		'DB_NAME': project_name.toUpperCase(),
		'SECRET': generateRandomString( 16 ),
		'REMOTE': generateRandomString( 16 ),
	} );

	// create etc/config directories
	if ( !fs.existsSync( 'etc' ) ) {
		fs.mkdirSync( 'etc' );
	}

	if ( !fs.existsSync( 'etc/config' ) ) {
		fs.mkdirSync( 'etc/config' );
	}

	createFile( 'etc/config/data.json', content, true, true );
};

const _addDeps = ( pm ) => {
	// add dependencies
	const deps = [
		[ "@fsoft/diff-patch", false ],
		[ "arangojs", false ],
		[ "body-parser", false ],
		[ "cors", false ],
		[ "exif", false ],
		[ "express@4.19.2", false ],
		[ "express-dump-curl", false ],
		[ "express-fileupload", false ],
		[ "handlebars", false ],
		[ "jsonwebtoken", false ],
		[ "mime-types", false ],
		[ "node-2fa", false ],
		[ "nodemailer", false ],
		[ "pdf-lib", false ],
		[ "sharp", false ],
		[ "socket.io", false ],

		[ "@types/body-parser", true ],
		[ "@types/exif", true ],
		[ "@types/express@4.17.21", true ],
		[ "@types/express-fileupload", true ],
		[ "@types/jsonwebtoken", true ],
		[ "@types/mime-types", true ],
		[ "@types/node", true ],
		[ "nodemon", true ],
		[ "typescript", true ],
	];

	const depsNoDev = deps.filter( ( [ , dev ] ) => !dev );
	const depsDev = deps.filter( ( [ , dev ] ) => dev );

	addDependencies( pm, depsNoDev.map( ( [ dep ] ) => dep ) );
	addDependencies( pm, depsDev.map( ( [ dep ] ) => dep ), true );
};

const _addPackageJson = () => {
	// add scripts to package.json
	const packageJson = JSON.parse( fs.readFileSync( 'package.json' ) );
	packageJson.scripts = {
		"dev": "tsc --build . -w",
		"start": "nodemon --ext js --ignore node_modules --watch dist/server dist/server/server.js",
		"start-empty": "export EMPTY_DB=1; export TEST_DB=1; nodemon --ext js --ignore node_modules --watch dist/server dist/server/server.js",
		"test": "jest"
	};

	fs.writeFileSync( 'package.json', JSON.stringify( packageJson, null, 2 ) );
};


const nodeCreateProject = ( project_name, pm, port ) => {
	console.log( 'Creating Node project:', project_name );
	console.log( `Using package manager: ${ pm }` );

	// create project directory if it doesn't exist
	if ( !fs.existsSync( project_name ) ) {
		fs.mkdirSync( project_name );
	}

	// enter project directory
	process.chdir( project_name );

	// init using package manager
	execSync( `${ pm } init`, { stdio: 'inherit' } );

	// save current directory
	const cwd = process.cwd();

	_addDeps( pm );
	_addPackageJson();
	_createFiles();
	_createServer();
	_addSubmodules( pm );

	process.chdir( cwd );
	_createDataConfig( project_name, port );

};

module.exports = {
	nodeCreateProject
};
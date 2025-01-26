const { execSync } = require( 'child_process' );

const pm_add_deps = ( pm, deps, dev = false ) => {
	let cmd = '';

	switch ( pm ) {
		case 'pnpm':
		case 'yarn':
			cmd = `${ pm } add ${ dev ? '-D' : '' } ${ deps.join( ' ' ) } --silent`;
			break;

		case 'npm':
			cmd = `npm install ${ dev ? '--save-dev' : '' } ${ deps.join( ' ' ) } --silent`;
			break;
	}

	if ( !cmd ) {
		console.log( `ERROR: Unknown package manager: ${ pm }` );
		return;
	}

	console.log( "Executing: ", cmd );

	execSync( cmd, { stdio: 'inherit' } );
};

const pm_run_script = ( pm, script ) => {
	let cmd = '';

	switch ( pm ) {
		case 'pnpm':
		case 'yarn':
			cmd = `${ pm } ${ script }`;
			break;

		case 'npm':
			cmd = `npm run ${ script }`;
			break;
	}

	if ( !cmd ) {
		console.log( `ERROR: Unknown package manager: ${ pm }` );
		return;
	}

	console.log( "Executing: ", cmd );

	execSync( cmd, { stdio: 'inherit' } );
};

module.exports = {
	pm_add_deps,
	pm_run_script
};
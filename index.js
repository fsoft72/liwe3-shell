#!/usr/bin/env node

const VERSION = "0.9.0";

const yargs = require( "yargs/yargs" );
const { hideBin } = require( "yargs/helpers" );

const { cfCreate, cfInit, cfUpdate } = require( "./data/cf_ops" );
const { mcpCatalog, mcpAdd, mcpList, mcpDel } = require( "./data/mcp_ops" );

const argv = yargs( hideBin( process.argv ) )
	.usage( "Usage: $0 <command> [options]" )

	.command(
		"create [folder]",
		"Create new LiWE3 Cloudflare project",
		( yargs ) => {
			return yargs.positional( "folder", {
				describe:
					"Project folder name (uses current dir if omitted, must be empty)",
				type: "string",
			} );
		},
	)
	.command( "init", "Initialize working repo (install deps, run setup scripts)" )
	.command(
		[ "update", "upgrade" ],
		"Merge latest liwe3-cloudflare changes into current repo",
	)
	.command( "mcp <subcommand> [name]", "Manage MCP servers", ( yargs ) => {
		return yargs
			.positional( "subcommand", {
				describe: "catalog | add | list | del",
				type: "string",
				choices: [ "catalog", "add", "list", "del" ],
			} )
			.positional( "name", {
				describe: "MCP name (required for add / del)",
				type: "string",
			} );
	} )
	.version( VERSION )
	.help().argv;

switch ( argv._[ 0 ] ) {
	case "create":
		cfCreate( argv.folder );
		break;
	case "init":
		cfInit();
		break;
	case "update":
	case "upgrade":
		cfUpdate();
		break;
	case "mcp":
		switch ( argv.subcommand ) {
			case "catalog":
				mcpCatalog();
				break;
			case "add":
				mcpAdd( argv.name );
				break;
			case "list":
				mcpList();
				break;
			case "del":
				mcpDel( argv.name );
				break;
			default:
				console.log( 'Unknown mcp subcommand. Use: catalog | add <name> | list | del <name>' );
		}
		break;
	default:
		yargs().showHelp();
}

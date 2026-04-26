#!/usr/bin/env node

const VERSION = "0.7.0";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { cfCreate, cfInit, cfUpdate } = require("./data/cf_ops");

const argv = yargs(hideBin(process.argv))
	.usage("Usage: $0 <command> [options]")

	.command(
		"create [folder]",
		"Create new LiWE3 Cloudflare project",
		(yargs) => {
			return yargs.positional("folder", {
				describe:
					"Project folder name (uses current dir if omitted, must be empty)",
				type: "string",
			});
		},
	)
	.command("init", "Initialize working repo (install deps, run setup scripts)")
	.command(
		["update", "upgrade"],
		"Merge latest liwe3-cloudflare changes into current repo",
	)
	.version(VERSION)
	.help().argv;

switch (argv._[0]) {
	case "create":
		cfCreate(argv.folder);
		break;
	case "init":
		cfInit();
		break;
	case "update":
	case "upgrade":
		cfUpdate();
		break;
	default:
		yargs().showHelp();
}

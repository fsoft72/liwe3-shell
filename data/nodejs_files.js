const eslintIgnore = `# don't ever lint node_modules
node_modules
# don't lint build output (make sure it's set to your correct build folder name)
dist
# don't lint nyc coverage output
coverage

static
`;

const eslintRC = `module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/interface-name-prefix': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-inferrable-types': 0,
		'@typescript-eslint/no-use-before-define': 0,
		'no-async-promise-executor': 0,
		'no-empty': 0

	}
};
`;

const tsConfig = `{
	"compilerOptions": {
		"composite": true,
		"declaration": true,
		"module": "commonjs",
		"moduleResolution": "node",
		"noImplicitAny": true,
		"noImplicitReturns": true,
		"outDir": "dist",
		"sourceMap": true,
		"skipLibCheck": true,
		"target": "esnext",
		"rootDir": ".",
		"rootDirs": [
			"server",
		],
		"strict": false
	},
	"include": [
		"server/**/*",
		"server/*"
	],
	"exclude": [
		"node_modules",
		"dist",
		"server/**/*.spec.ts",
		"server/**/*.test.ts",
		"server/**/*.spec.tsx",
		"server/**/*.test.tsx",
		"server/**/*.spec.js",
		"server/**/*.test.js",
		"server/**/*.spec.jsx",
		"server/**/*.test.jsx"
	]
}
`;

const gitIgnore = `
*.lock
*.old
node_modules
dist
etc/config/data.json
etc/locales
static/uploads
static/temp
static/public/uploads
static/public/temp
`;

const server = `import { server } from './liwe/startup';
import { LiWEServerOptions } from './liwe/types';

const options: LiWEServerOptions = {
	middlewares: []
};

// if you put EMPTY_DB = 1, the DB is deleted at each restart
// process.env.EMPTY_DB = "1";

server( null, options )
	.then( () => {
		console.log( \`Server started: http://localhost:\` + options.port );
	} );
`;

const dataConfig = `{
	"app": {
		"name": "%%APP_NAME%%",
		"default_language": "en",
		"domain": "default",
		"return_domains": false,
		"startup": {
			"modules": [
				"user",
				"system",
				"tag"
			]
		}
	},
	"debug": {
		"enabled": true,
		"send_code": true,
		"query_dump": true,
		"auth_dump": true,
		"challenge": ""
	},
	"server": {
		"port": %%PORT%%
	},
	"upload": {
		"max_upload_size": 5
	},
	"security": {
		"secret": "%%SECRET%%",
		"enable_cookie": false,
		"cookie": "auth",
		"enable_token": true,
		"header": "authorization",
		"param_name": "Bearer",
		"token_expires": 200000,
		"auth_order": [
			"param",
			"header",
			"cookie"
		],
		"check_permissions": true,
		"throttler": {
			"enabled": false,
			"request_count": 1,
			"request_interval": 5,
			"wait_time": 1000
		},
		"remote": "%%REMOTE%%"
	},
	"database": {
		"type": "arangodb",
		"dbname": "%%DB_NAME%%",
		"server": "http://localhost:8529"
	},
	"auth": {
		"local": true,
		"jwt": true,
		"success": "/",
		"failure": "/login",
		"code_length": 6
	},
	"aws": {
		"region": "eu-central-1"
	},
	"smtp": {
		"protocol": "smtps",
		"server": "",
		"port": 587,
		"login": "",
		"password": "",
		"dump_on_console": true,
		"send_for_real": false,
		"from": "info@example.com"
	},
	"user": {
		"auto_enabled": true,
		"auth_code_length": 6,
		"auth_code_forced": false,
		"auth_code_numbers": false,
		"auth_code_debug": true,
		"jwt_dump": false,
		"debug": true,
		"secure_passwords": true,
		"password": {
			"enforce": true,
			"min_len": 7,
			"secure": true
		},
		"recaptcha": {
			"enabled": false,
			"secret": "0x0000000000000000000000000000000000000000"
		},
		"users": [
			{
				"email": "admin@gmail.com",
				"password": "UserAdmin1!",
				"username": "..admin",
				"name": "Johnny",
				"lastname": "Admin",
				"enabled": true,
				"visible": false,
				"perms": {
					"system": [
						"admin"
					]
				}
			}
		]
	},
	"features": {
		"trace": true,
		"trace_ok": false,
		"passport": true,
		"jwt": true,
		"curl": true,
		"DISABLED_curl_file": "/ramdisk/ACADEMY.txt",
		"ssl": true,
		"socketio": true,
		"socketio_debug": true,
		"sse": false,
		"sse_debug": false
	}
}
`;

module.exports = {
	eslintIgnore,
	eslintRC,
	tsConfig,
	gitIgnore,
	server,
	dataConfig
};;
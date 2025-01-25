const maid = `{
    "patterns": [
        ".vscode",
        "*.cjs",
        ".prettier*",
        "*.md",
        "*config*",
        "*yaml",
        "*.d.ts",
        "*.css",
        "*.svg",
        "md5.js",
        "*.tests.*",
        "*.test.*",
        "*.map",
        "dist"
    ],
    "rules": [
        {
            "name": "Remove styles in svelte",
            "pattern": "*.svelte",
            "start": "<style",
            "delete": "</style>"
        },
        {
            "name": "Remove empty lines",
            "pattern": "*.*",
            "start": "^\\s*$",
            "delete": "::line::"
        },
        {
            "name": "Multiline comments",
            "pattern": "*.*",
            "start": "/\\*",
            "delete": "\\*/"
        }
    ]
}
`;

const layout = `<script lang="ts">
	import '$modules/theme/data/liwe3-styles.css';

	import Toasts from '$liwe3/components/Toasts.svelte';
	// import SSEClient from '$liwe3/lib/sse';    // uncomment if you need to use SSE
	import storeApp from '$liwe3/stores/app.svelte';

	import { user_init } from '$modules/user/actions';
	import { onMount } from 'svelte';

	import Spinner from '$liwe3/components/Spinner.svelte';
	import { themeCreateDefault } from '$modules/theme/theme';
	import { formCreatorPluginRegister } from '$liwe3/components/FormCreator.svelte';

	import FormTextInput from '$liwe3/components/form_plugins/FormTextInput.svelte';
	import FormButton from '$liwe3/components/form_plugins/FormButton.svelte';
	import FormCheckbox from '$liwe3/components/form_plugins/FormCheckbox.svelte';
	import FormDraggableList from '$liwe3/components/form_plugins/FormDraggableList.svelte';
	import FormElementList from '$liwe3/components/form_plugins/FormElementList.svelte';
	import FormHidden from '$liwe3/components/form_plugins/FormHidden.svelte';
	import FormMarkdown from '$liwe3/components/form_plugins/FormMarkdown.svelte';
	import FormSelect from '$liwe3/components/form_plugins/FormSelect.svelte';
	import FormTags from '$liwe3/components/form_plugins/FormTags.svelte';
	import FormTextArea from '$liwe3/components/form_plugins/FormTextArea.svelte';
	import FormTitle from '$liwe3/components/form_plugins/FormTitle.svelte';
	import { PUBLIC_LIWE_SERVER } from '$env/static/public';

	interface Props {
		children: any;
	}

	let { children }: Props = $props();

	let isReady = $state(false);

	onMount(async () => {
		/*
		// SEE Client Startup  ======================================
		storeApp.sse = new SSEClient(PUBLIC_LIWE_SERVER + '/sse');

		// NOTE: add ActionListeners BEFORE the connect()
		storeApp.sse?.addActionListener('connected', (payload: any) => {
			console.log('=== SSE Connected to server: ', payload.data);
			storeApp.sseConnected = true;
		});

		storeApp.sse?.addActionListener('error', () => {
			console.log('=== SSE Connection ERROR');
			storeApp.sseConnected = false;
		});

		storeApp.sse?.connect();
		// ==========================================================
		*/

		themeCreateDefault({
			mode: 'dark',
			light: {
				mode1: '#c5c6d3',
				mode2: '#fff714',
				mode3: '#c4d4ed',
				mode4: '#ffff00',
				info: '#0000ff',
				error: '#ff0000',
				warning: '#ffff00',
				success: '#00ff00',
				dark: '#000000',
				background: '#d1d1d1',
				color: '#000000',
				link: '#0000ff'
			},
			dark: {
				mode1: '#878787',
				mode2: '#4959a7',
				mode3: '#454545',
				mode4: '#68dbe3',
				info: '#353597',
				error: '#7e1111',
				warning: '#eabf62',
				success: '#326c32',
				dark: '#000000',
				background: '#160e0e',
				color: '#ffffff',
				link: '#0000ff'
			},
			vars: {
				'font-size': '16px',
				'font-weight': '400',
				'line-height': '1.2rem',
				'border-radius': '0.15rem',
				'border-width': '1px',
				'border-style': 'solid',
				'button-padding-y': '0.35rem',
				'button-padding-x': '0.5rem',
				'input-padding-y': '0.15rem',
				'input-padding-x': '0.15rem'
			}
		});

		formCreatorPluginRegister('text', FormTextInput);
		formCreatorPluginRegister('string', FormTextInput);
		formCreatorPluginRegister('color', FormTextInput, { type: 'color' });
		formCreatorPluginRegister('email', FormTextInput, { type: 'email' });
		formCreatorPluginRegister('password', FormTextInput, { type: 'password' });
		formCreatorPluginRegister('number', FormTextInput, { type: 'number' });
		formCreatorPluginRegister('button', FormButton);
		formCreatorPluginRegister('checkbox', FormCheckbox);
		formCreatorPluginRegister('draggable-list', FormDraggableList);
		formCreatorPluginRegister('element-list', FormElementList);
		formCreatorPluginRegister('generic-input', FormTextInput);
		formCreatorPluginRegister('hidden', FormHidden);
		formCreatorPluginRegister('markdown', FormMarkdown);
		formCreatorPluginRegister('select', FormSelect);
		formCreatorPluginRegister('tags', FormTags);
		formCreatorPluginRegister('textarea', FormTextArea);
		formCreatorPluginRegister('title', FormTitle);

		await user_init();

		isReady = true;
	});
</script>

<Toasts />

{#if isReady}
	<div class="container liwe3-theme">
		<div class="toolbar">
			SSE: {#if storeApp.sseConnected}
				Connected
			{:else}
				Disconnected
			{/if}
		</div>
		<!--
        {#if has_one_perm($user, ['user.admin'])}
            <div style="padding: 15px">&nbsp;</div>
        {/if}
        -->
		<div style="margin-bottom: 5em; width: 100%">
			{@render children()}
		</div>
	</div>
{:else}
	<div class="container">
		<Spinner />
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;

		background-color: var(--liwe3-background);

		overflow: auto;
	}
</style>
`;

const config = `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$liwe3: './src/liwe3',
			'$liwe3/*': './src/liwe3/*',
			$modules: './src/modules',
			'$modules/*': './src/modules/*',
		},

	}
};

export default config;
`;

module.exports = {
	maid,
	layout,
	config
};
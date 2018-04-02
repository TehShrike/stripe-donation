import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import svelte from 'rollup-plugin-svelte'

export default {
	output: {
		format: `cjs`,
	},
	plugins: [
		svelte(),
		resolve({
			main: false,
			browser: true,
		}),
		babel({
			exclude: `node_modules/**`,

			presets: [
				[
					`babel-preset-env`,
					{
						modules: false,
					},
				],
			],
		}),
	],
}

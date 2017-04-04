import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import svelte from 'rollup-plugin-svelte'

export default {
	format: 'cjs',
	plugins: [
		svelte(),
		resolve(),
		babel({
			exclude: 'node_modules/**' // only transpile our source code
		})
	]
}

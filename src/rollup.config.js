import { string } from "rollup-plugin-string"
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

module.exports = {
	input: './client/client.js',
	output: {
		file: '../js/build.js',
		format: 'cjs',
	},
	plugins: [
		string({
			include: "**/*.html",
		}),
		commonjs(),
		resolve({
			mainFields: [ 'browser', 'module', 'main' ],
		}),
	],
}

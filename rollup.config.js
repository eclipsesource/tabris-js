import buble from 'rollup-plugin-buble';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

const plugins = [buble({
		transforms: {
			dangerousForOf: true
		}
	})];

export default {
	entry: 'src/main.js',
	format: 'umd',
	dest: 'tezNative.js', // equivalent to --output
	moduleName: 'tezNative',
	external,
	plugins: plugins
}

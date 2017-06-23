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
	dest: 'tabris.js', // equivalent to --output
	globals: {
		'es6-tween': 'TWEEN'
	},
	moduleName: 'tabris',
	//external,
	//exports: 'default',
	plugins: plugins
}

import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import {
	minify
}
from 'uglify-es';
import './server';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

const {
	BUILD
} = process.env;

const plugins = [buble({
		jsx: 'JSX.createElement',
		transforms: {
			forOf: false
		}
	})];
	plugins.push(uglify({}, minify));

export default {
	entry: 'app.js',
	format: 'iife',
	dest: 'dist.js', // equivalent to --output
	//globals: {},
	moduleName: 'App',
	external,
	//exports: 'default',
	plugins: plugins
}

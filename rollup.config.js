import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';
import nested from 'postcss-nested';

export default {
  input: 'js/main.js',
  output: {
    file: 'assets/js/js.js',
    format: 'iife'
  },
  sourcemaps: true,
  plugins: [
    postcss({
      extract: 'assets/css/css.css',
      minimize: true,
      plugins: [
        nested(),
        autoprefixer({
          browsers: ['last 1 version']
        })
      ]
    }),
    babel({
      presets: [
        [
          'es2015', {
            modules: false
          }
        ]
      ],
      babelrc: false,
      exclude: 'node_modules/**'
    }),
    resolve(),
    (process.env.BUILD === 'production' && uglify()),
    commonjs()
  ]
}
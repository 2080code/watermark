import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

export default {
  input: 'index.js',
  output: {
    file: 'lib/watermark.min.js',
    format: 'umd',
    name: 'WaterMark',
    compact: true,
    sourcemap: true
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({
      babelHelpers: 'bundled',
    //   presets: [
    //     ['@babel/preset-env', {
    //       // 配置项
    //       targets: {
    //         chrome: '58',
    //         ie: '11'
    //       }
    //     }]
    //   ]
    }),
    terser()
  ]

}
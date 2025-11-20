import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'index.ts',
  output: [{
    file: 'dist/watermark.js',
    name: 'WaterMark',
  },{
    file: 'lib/watermark.min.js',
    format: 'umd',
    name: 'WaterMark',
    sourcemap: true,
    plugins: [terser()]
  }],
  plugins: [
    commonjs(),
    resolve(),
    typescript(),
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
  ]

}
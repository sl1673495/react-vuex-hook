const path = require('path')
const { resolve } = path
module.exports = {
  mode: 'production',
  entry: {
    index: resolve('./src'),
  },
  output: {
    path: resolve('./dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        include: [resolve('src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
  }
}

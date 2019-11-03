const path = require('path')
const { resolve } = path
module.exports = {
  mode: 'production',
  entry: {
    app: resolve('./src/index.jsx'),
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)/,
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

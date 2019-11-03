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
        options: {
          "presets": ["@babel/preset-env", "@babel/preset-react"],
        }
      },
    ],
  },
  externals: {
    react: 'React'
  }
}

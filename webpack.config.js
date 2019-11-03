const path = require('path')
const { resolve } = path
module.exports = {
  mode: 'production',
  entry: {
    app: resolve('./src/index.tsx'),
  },
  externals: {
    react: 'React'
  }
}

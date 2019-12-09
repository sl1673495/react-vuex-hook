export default {
  entry: 'src/index.jsx',
  doc: {
    title: 'react-vuex使用文档',
    base: process.env.NODE_ENV === 'production' ? '/react-vuex/' : '',
    dest: 'docs',
    typescript: true
  },
  cjs: {
    type:'babel',
    minify: true
  },
}
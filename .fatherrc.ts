export default {
  entry: 'src/index.jsx',
  doc: {
    title: 'reax-hook使用文档',
    base: process.env.NODE_ENV === 'production' ? '/reax-hook/' : '',
    dest: 'docs',
    typescript: true
  },
  cjs: {
    type:'babel',
    minify: true
  },
}
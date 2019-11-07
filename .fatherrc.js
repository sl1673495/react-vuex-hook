export default {
  entry: 'src/index.jsx',
  doc: {
    title: 'reax-hook使用文档',
    base: '/reax-hook/',
    dest: 'docs',
    typescript: true
  },
  cjs: {
    type:'babel',
    minify: true
  },
}
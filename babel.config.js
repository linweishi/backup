// 项目发布阶段需要用到的 babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品的时候的插件数组，扩展运算符将所有的prodPlugins数组内的插件在此展开
    ...prodPlugins

  ]
}

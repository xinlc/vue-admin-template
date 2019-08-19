module.exports = {
  // 由于cssnext和cssnano都具有autoprefixer,事实上只需要一个，所以把默认的autoprefixer删除掉，然后把cssnano中的autoprefixer设置为false。
  // plugins: {
  //   // https://github.com/postcss/autoprefixer
  //   autoprefixer: {}
  // }
  'plugins': {
    // https://github.com/postcss/postcss-import
    'postcss-import': {},
    // https://github.com/postcss/postcss-url
    'postcss-url': {},
    // https://github.com/yisibl/postcss-aspect-ratio-mini
    // 处理元素容器宽高比
    'postcss-aspect-ratio-mini': {},
    // https://github.com/jonathantneal/postcss-write-svg
    // 来处理移动端1px的解决方案
    'postcss-write-svg': {
      utf8: false
    },
    // https://cssnext.github.io/features/#automatic-vendor-prefixes
    // cssnext 该插件可以让我们使用CSS未来的特性，其会对这些特性做相关的兼容性处理
    'postcss-cssnext': {},
    // https://github.com/evrone/postcss-px-to-viewport
    // px to vw
    'postcss-px-to-viewport': {
      viewportWidth: 1920, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
      viewportHeight: 1080, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
      unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
      selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false // 允许在媒体查询中转换`px`
    },
    // https://github.com/springuper/postcss-viewport-units
    // 给CSS的属性添加content的属性，配合viewport-units-buggyfill库给vw、vh、vmin和vmax做适配的操作。
    // 现代浏览器支持vewport单位，不需要适配
    // 'postcss-viewport-units': {},

    // https://cssnano.co/guides/getting-started/
    // cssnano主要用来压缩和清理CSS代码。在Webpack中，cssnano和css-loader捆绑在一起，所以不需要自己加载它。不过你也可以使用postcss-loader显式的使用cssnano。
    // autoprefixer和postcss-zindex禁掉了。前者是有重复调用，后者只要启用了这个插件，z-index的值就会重置为1。
    'cssnano': {
      preset: 'advanced',
      autoprefixer: false,
      'postcss-zindex': false
    }
  }
}

/* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
const path = require('path');

const config = {};

// + vars
const PROJECT_NAME = 'view';
const WORKFLOW = 'webpack-vue2';
const PLATFORM = 'pc';
const VERSION = '3.3.3';
const SRC_ROOT = './src';
const COMMON_PATH = '../commons';
// - vars

// + setting
const setting = {
  localserver: { // 本地服务器配置
    root: './dist', // 服务器输出地址
    port: 5000 // 服务器 port
  },
  dest: {
    basePath: '/',
    jsPath: 'assets/js',
    jslibPath: 'assets/js/lib',
    cssPath: 'assets/css',
    htmlPath: '',
    imagesPath: 'assets/images',
    tplPath: 'assets/tpl',
    revPath: 'assets/rev'
  },
  // 代理服务器
  proxy: {
    port: 8887,
    localRemote: {
      'http://web.yy.com/': 'http://127.0.0.1:5000/'
    },
    homePage: 'http://web.yy.com/'
  }
};
// - setting

// + base
Object.assign(config, {
  workflow: WORKFLOW,
  name: PROJECT_NAME,
  version: VERSION,
  platform: PLATFORM,
  proxy: setting.proxy,
  localserver: setting.localserver,
  dest: setting.dest,
  commit: {},

  concat: { // js 合并
    // '{$jsDest}/vendors.js': ['{$srcRoot}/js/lib/a.js', '{$srcRoot}/js/lib/b.js']
  },
  resource: { // 自定义项目中其他需打包的文件夹
    // 'src/pc/svga': path.join(setting.localserver.root, setting.dest.basePath, 'tpl')
  },
  plugins: [ // 额外的 npm 组件
    // 'yyl-flexlayout'
  ]
});
// - base

config.plugins.push('yyl-flexlayout');

// + alias
const DEST_BASE_PATH = path.join(setting.localserver.root, setting.dest.basePath);
Object.assign(config, {
  alias: {
    // 输出目录中 到 html, js, css, image 层 的路径
    'root': DEST_BASE_PATH,
    // rev 输出内容的相对地址
    'revRoot': DEST_BASE_PATH,
    // dest 地址
    'destRoot': setting.localserver.root,
    // src 地址
    'srcRoot': SRC_ROOT,
    // 项目根目录
    'dirname': './',
    // 公用组件地址
    'commons': COMMON_PATH,
    // 公用 components 目录
    'globalcomponents': path.join(COMMON_PATH, 'components'),
    'globallib': path.join(COMMON_PATH, 'lib'),
    // js 输出地址
    'jsDest': path.join(DEST_BASE_PATH, setting.dest.jsPath),
    // js lib 输出地址
    'jslibDest': path.join(DEST_BASE_PATH, setting.dest.jslibPath),
    // html 输出地址
    'htmlDest': path.join(DEST_BASE_PATH, setting.dest.htmlPath),
    // css 输出地址
    'cssDest': path.join(DEST_BASE_PATH, setting.dest.cssPath),
    // images 输出地址
    'imagesDest': path.join(DEST_BASE_PATH, setting.dest.imagesPath),
    // assets 输出地址
    'revDest': path.join(DEST_BASE_PATH, setting.dest.revPath),
    // tpl 输出地址
    'tplDest': path.join(DEST_BASE_PATH, setting.dest.tplPath),
    // webpackconfig 中的 alias
    '@': SRC_ROOT,
    '~@': path.join(SRC_ROOT, 'components')
    // + yyl make
    // - yyl make
  }
});


// + commit
Object.assign(config, {
  commit: {
    type: 'gitlab-ci',
    hostname: '/'
  }
});
// - commit

module.exports = config;

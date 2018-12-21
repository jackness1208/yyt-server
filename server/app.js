const Koa = require('koa');
const util = require('yyl-util');
const extOs = require('yyl-os');
const extFs = require('yyl-fs');
const print = require('yyl-print');
const chalk = require('chalk');
const path = require('path');
const seed = require('yyl-seed-webpack-vue2');
const serve = require('koa-static');
const fs = require('fs');

const cache = {
  server: null
};

const DEFAULT_CONFIG = {
  port: 80
};

const VIEW_CONFIG_DIR = path.join(__dirname, '../view');
const VIEW_CONFIG_PATH = path.join(VIEW_CONFIG_DIR, 'config.js');
const DIST_PATH = path.join(__dirname, '../view/dist');
const PROJECT_MODULE_PATH = path.join(__dirname, '../node_modules');

const fn = {
  async clearDest() {
    return await extFs.removeFiles(DIST_PATH);
  },
  initPlugins(config) {
    if (!config.plugins || !config.plugins.length) {
      return Promise.resolve();
    }
    const iNodeModulePath = config.resolveModule;

    if (!iNodeModulePath) {
      return new Promise((next, reject) => {
        reject('init plugins fail, config.resolveModule is not set');
      });
    }

    if (!fs.existsSync(iNodeModulePath)) {
      extFs.mkdirSync(iNodeModulePath);
    }
    const installLists = [];

    config.plugins.forEach((str) => {
      let iDir = '';
      let iVer = '';
      const pathArr = str.split(/[\\/]+/);
      let pluginPath = '';
      let pluginName = '';
      if (pathArr.length > 1) {
        pluginName = pathArr.pop();
        pluginPath = pathArr.join('/');
      } else {
        pluginName = pathArr[0];
      }

      if (~pluginName.indexOf('@')) {
        iDir = pluginName.split('@')[0];
        iVer = pluginName.split('@')[1];
      } else {
        iDir = pluginName;
      }
      let iPath = path.join(iNodeModulePath, pluginPath, iDir);
      let iPkgPath = path.join(iPath, 'package.json');
      var iPkg;
      if (fs.existsSync(iPath) && fs.existsSync(iPkgPath)) {
        if (iVer) {
          iPkg = require(iPkgPath);
          if (iPkg.version != iVer) {
            installLists.push(str);
          }
        }
      } else {
        installLists.push(str);
      }
    });

    if (installLists.length) {
      var cmd = `npm install ${installLists.join(' ')} --loglevel http`;
      print.log.info(`run cmd ${cmd}`);

      return new Promise((next, reject) => {
        util.runCMD(cmd, (err) => {
          if (err) {
            return reject(err);
          }

          next();
        }, iNodeModulePath);
      });
    } else {
      return Promise.resolve();
    }
  },
  parseConfig(configPath) {
    const config = require(configPath);
    const dirname = path.dirname(configPath);

    // alias format to absolute
    Object.keys(config.alias).forEach((key) => {
      config.alias[key] = util.path.resolve(
        dirname,
        config.alias[key]
      );
    });

    if (config.resource) {
      Object.keys(config.resource).forEach((key) => {
        const curKey = util.path.resolve(dirname, key);
        config.resource[curKey] = util.path.resolve(dirname, config.resource[key]);
        delete config.resource[key];
      });
    }

    return config;
  }
};



const app = {
  async start (iEnv) {
    const config = util.extend(true, DEFAULT_CONFIG, iEnv);
    const canUse = await extOs.checkPort(config.port);

    const viewConfig = fn.parseConfig(VIEW_CONFIG_PATH);

    viewConfig.resolveModule = PROJECT_MODULE_PATH;

    if (viewConfig.plugins) {
      await fn.initPlugins(viewConfig);
    }

    if (!iEnv.logLevel) {
      iEnv.logLevel = 2;
    }

    if (!canUse) {
      throw new Error(`start yyt server fiail, ${config.port} was occupied`);
    }

    cache.server = new Koa();

    cache.server.use(serve(DIST_PATH));

    const opzer = seed.optimize(viewConfig, VIEW_CONFIG_DIR);

    await opzer.initServerMiddleWare(cache.server, iEnv);

    await fn.clearDest();

    await util.makeAwait((done) => {
      cache.server.listen(config.port, () => {
        const address = `http://${extOs.LOCAL_IP}:${config.port}`;

        print.log.success(`server start finished, address: ${chalk.yellow.bold(address)}`);

        let firstRun = true;
        opzer.watch(iEnv)
          .on('clear', () => {
            if (!firstRun) {
              util.cleanScreen();
            }
          })
          .on('msg', (...argv) => {
            const [type, iArgv] = argv;
            let iType = type;
            if (!print.log[type]) {
              iType = 'info';
            }
            print.log[iType](iArgv);
          })
          .on('finished', () => {
            print.log.success('task finished');
            if (firstRun) {
              firstRun = false;
              if (!iEnv.silent) {
                extOs.openPath(address);
              }
              done();
            }
          });
      });
    });
  },
  abort () {
    if (cache.server) {
      cache.server.abort();
    }
    return Promise.resolve(null);
  }
};

module.exports = app;

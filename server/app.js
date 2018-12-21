const Koa = require('koa');
const util = require('yyl-util');
const extOs = require('yyl-os');
const print = require('yyl-print');
const chalk = require('chalk');
const seed = require('yyl-seed-webpack-vue2');

const cache = {
  server: null
};

const DEFAULT_CONFIG = {
  port: 80
};


const app = {
  async start (iEnv) {
    const config = util.extend(true, DEFAULT_CONFIG, iEnv);
    const canUse = await extOs.checkPort(config.port);

    if (!canUse) {
      throw new Error(`start yyt server fiail, ${config.port} was occupied`);
    }

    cache.server = new Koa();
    cache.server.use((ctx) => {
      ctx.body = 'hello koa2';
    });

    await util.makeAwait((done) => {
      cache.server.listen(config.port, () => {
        const address = `http://${extOs.LOCAL_IP}:${config.port}`;
        if (!iEnv.silent) {
          util.cleanScreen();
        }
        print.log.success(`server start finished, address: ${chalk.yellow.bold(address)}`);
        if (!iEnv.silent) {
          extOs.openPath(address);
        }
        done();
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

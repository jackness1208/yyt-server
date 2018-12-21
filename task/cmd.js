const pkg = require('../package.json');
const util = require('yyl-util');
const print = require('yyl-print');
const chalk = require('chalk');

const app = require('../server/app.js');

// const PROJECT_PATH = process.cwd();

const cmd = {
  help(iEnv) {
    const h = {
      usage: 'yyts',
      commands: {
        'start': 'start yyt server'
      },
      options: {
        '-h, --help': 'print usage information',
        '-v, --version': 'print version'
      }
    };
    if (!iEnv.silent) {
      util.help(h);
    }
    return Promise.resolve(h);
  },
  async version(iEnv) {
    if (!iEnv.silent) {
      const logArr = await print.borderBox([
        'yyt e2e server',
        `yyts ${chalk.yellow.bold(pkg.version)}`
      ]);
      console.log(logArr.join('\n'));
    }
    return pkg.version;
  },
  async start(iEnv) {
    return await app.start(iEnv);
  }
};


module.exports = cmd;

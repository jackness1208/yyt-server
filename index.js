const cmd = require('./task/cmd.js');

const entry = {
  run: async (ctx, iEnv) => {
    switch (ctx) {
      case 'start':
        await cmd.start(iEnv);
        break;
      case '-v':
      case '--version':
        await cmd.version(iEnv);
        break;

      case '-h':
      case '--help':
        await cmd.help(iEnv);
        break;

      default:
        await cmd.help(iEnv);
        break;
    }
  }
};

module.exports = entry;

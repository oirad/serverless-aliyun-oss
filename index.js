'use strict';

const AliyunOss = require('./deploy/aliyunOss');
const AliyunOssRemove = require('./deploy/aliyunOssRemove');

class AliyunIndex {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      client: {
        usage: 'Generate and deploy clients',
        lifecycleEvents: ['client', 'deploy'],
        commands: {
          deploy: {
            usage: 'Deploy serverless client code',
            lifecycleEvents: ['deploy']
          },
          remove: {
            usage: 'Removes deployed files and bucket',
            lifecycleEvents: ['remove']
          }
        }
      }
    };
    this.hooks = {
      'client:client': () => {
        serverless.cli.log(this.commands.client.usage);
      },
      'client:remove': async () => {
        serverless.cli.log(this.commands.client.usage);
      }
    };

    this.serverless.pluginManager.addPlugin(AliyunOss);
    this.serverless.pluginManager.addPlugin(AliyunOssRemove);
  }
}

module.exports = AliyunIndex;

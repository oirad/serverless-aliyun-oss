'use strict';

const co = require('co');

const getCdnClient = require('./lib/getCdnClient');

class AliyunCdnRemove {
  constructor(serverless) {
    this.serverless = serverless;
    this.options = serverless.service.custom ? serverless.service.custom.client || {} : {};
    this.provider = this.serverless.getProvider('aliyun');

    Object.assign(
      this,
      getCdnClient
    );

    this.hooks = {
      'client:remove:remove': async () => {
        await this.deleteCdn();
      }
    };
  }
  /**
   * Deletes the CDN
   */
  async deleteCdn() {
    if (this.options.domain) {
      const cdnClient = this.getCdnClient();
      const domain = this.options.domain;
      this.serverless.cli.log(`Removing the CDN for ${domain}`);
      return co(function* createCdn() {
        return cdnClient.request('DeleteCdnDomain', {
          DomainName: domain
        }, { method: 'POST' });
      });
    }
  }
}

module.exports = AliyunCdnRemove;

'use strict';

const co = require('co');

const getBucketName = require('./lib/getBucketName');
const getBucketId = require('./lib/getBucketId');
const getCdnClient = require('./lib/getCdnClient');

class AliyunCdn {
  constructor(serverless) {
    this.serverless = serverless;
    this.options = serverless.service.custom ? serverless.service.custom.client || {} : {};
    this.provider = this.serverless.getProvider('aliyun');

    Object.assign(
      this,
      getBucketName,
      getBucketId,
      getCdnClient
    );

    this.hooks = {
      'client:deploy': async () => {
        await this.createCdnIfNotExists();
      }
    };
  }
  /**
   * Creates a new bucket if is not existing
   */
  async createCdnIfNotExists() {
    await this.createCdn();
  }

  async createCdn() {
    const cdnClient = this.getCdnClient();
    const bucketUrl = `${this.getBucketName()}.oss-${this.provider.options.region}.aliyuncs.com`;
    return co(function* createCdn() {
      return cdnClient.request('AddCdnDomain', {
        DomainName: 'cdn.oirad.me',
        CdnType: 'web',
        Sources: `[{"content":"${bucketUrl}","type":"domain"}]`
      }, { method: 'POST' });
    });
  }
}

module.exports = AliyunCdn;

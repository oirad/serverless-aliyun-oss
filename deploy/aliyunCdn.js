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
   * Creates a new bucket if is not existing and if a domain is specified
   */
  async createCdnIfNotExists() {
    if (this.options.domain) {
      await this.createCdn();
    } else {
      const cdnUrl = `https://${this.getBucketName()}.oss-${this.provider.options.region}.aliyuncs.com`;
      this.serverless.cli.log(`No domain specified, use default oss internet URL [${cdnUrl}] to access the website (if bucket located outside of Mainland China)`);
    }
  }
  /**
   * Creates the CDN
   */
  async createCdn() {
    const cdnClient = this.getCdnClient();
    const bucketUrl = `${this.getBucketName()}.oss-${this.provider.options.region}.aliyuncs.com`;
    const domain = this.options.domain;
    const scope = this.options.cdnScope || 'global';
    this.serverless.cli.log(`Creating the CDN for ${domain}`);
    return co(function* createCdn() {
      return cdnClient.request('AddCdnDomain', {
        DomainName: domain,
        CdnType: 'web',
        SourceType: 'oss',
        Scope: scope,
        Sources: `[{"content":"${bucketUrl}","type":"oss"}]`
      }, { method: 'POST' });
    });
  }
}

module.exports = AliyunCdn;

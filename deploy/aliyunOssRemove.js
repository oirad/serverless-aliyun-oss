'use strict';

const getBucketName = require('./lib/getBucketName');

class AliyunOssRemove {
  constructor(serverless) {
    this.serverless = serverless;
    this.options = serverless.service.custom ? serverless.service.custom.client || {} : {};
    this.provider = this.serverless.getProvider('aliyun');

    Object.assign(
      this,
      getBucketName
    );

    this.hooks = {
      'client:remove:remove': async () => {
        await this.removeArtifacts();
      }
    };
  }
 
  /**
   * Removes all the files and the bucket itself
   */
  async removeArtifacts() {
    this.provider.resetOssClient(this.getBucketName());
    const objects = await this.provider.getObjects({ });
    const names = objects.map((obj) => obj.name);
    await this.provider.deleteObjects(names);
    await this.provider.deleteBucket(this.getBucketName());
    this.serverless.cli.log(`Deleted ${this.getBucketName()} OSS bucket`);
  }
}

module.exports = AliyunOssRemove;

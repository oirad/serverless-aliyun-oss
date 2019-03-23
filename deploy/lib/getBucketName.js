'use strict';

module.exports = {
  getBucketName() {
    return this.options.bucketName || `sls-${this.provider.key.aliyun_account_id}-client`;
  }
};
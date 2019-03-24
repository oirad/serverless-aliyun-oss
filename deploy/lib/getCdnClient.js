'use strict';

const Core = require('@alicloud/pop-core');

module.exports = {
  getCdnClient() {
    return new Core({
      accessKeyId: this.provider.key.aliyun_account_id,
      accessKeySecret: this.provider.key.aliyun_access_key_secret,
      endpoint: 'https://cdn.aliyuncs.com',
      apiVersion: '2018-05-10'
    });
  }
};
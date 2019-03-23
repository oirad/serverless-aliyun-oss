'use strict';

const path = require('path');
const fs = require('fs');
const co = require('co');

const getBucketName = require('./lib/getBucketName');
const getBucketId = require('./lib/getBucketId');

class AliyunOss {
  constructor(serverless) {
    this.serverless = serverless;
    this.options = serverless.service.custom ? serverless.service.custom.client || {} : {};
    this.provider = this.serverless.getProvider('aliyun');

    Object.assign(
      this,
      getBucketName,
      getBucketId
    );

    this.hooks = {
      'before:client:deploy': async () => {
        await this.loadTemplates();
        await this.initializeTemplate();
      },

      'client:deploy': async () => {
        await this.createBucketIfNotExists();
        await this.uploadArtifacts();
      }
    };
  }
  /**
   * Prepare template
   */
  async initializeTemplate() {
    const deploymentTemplate = this.serverless.utils.readFileSync(
      path.join(
        __dirname,
        'templates',
        'core-configuration-template.json'));

    deploymentTemplate.Resources[this.getBucketId()] = this.getStorageBucketResource();

    if (!this.templates.create.Resources[this.getBucketName()]) {
      this.templates.create = Object.assign(this.templates.create, deploymentTemplate);
    }
    if (!this.templates.update.Resources[this.getBucketName()]) {
      this.templates.update = Object.assign(this.templates.update, deploymentTemplate);
    }
  }
  /**
   * Returns the oss bucket configuration
   * 
   * @return {object}
   */
  getStorageBucketResource() {
    return {
      'Type': 'ALIYUN::OSS:Bucket',
      'Properties': {
        'BucketName': this.getBucketName(),
        'Region': this.provider.options.region
      }
    };
  }
  /**
   * Loads the templates
   */
  async loadTemplates() {
    const createFilePath = path.join(this.serverless.config.servicePath,
      '.serverless', 'configuration-template-create.json');
    const updateFilePath = path.join(this.serverless.config.servicePath,
      '.serverless', 'configuration-template-update.json');

    this.templates = {
      create: this.serverless.utils.readFileSync(createFilePath),
      update: this.serverless.utils.readFileSync(updateFilePath)
    };
  }
  /**
   * @param {string} bucketName
   */
  setBucketWebsite(bucketName) {
    const ossClient = this.provider.ossClient;
    const options = this.options;
    return co(function* createBucket() {
      return yield ossClient.putBucketWebsite(bucketName, {
        index: options.indexDocument || 'index.html',
        error: options.errorDocument || 'index.html' 
      });
    });
  }
  /**
   * @param {string} bucketName
   */
  setBucketPublic(bucketName) {
    const ossClient = this.provider.ossClient;
    return co(function* createBucket() {
      return yield ossClient.putBucketACL(bucketName, 'oss-cn-shanghai', 'public-read');
    });
  }
  /**
   * Creates a new bucket if is not existing
   */
  async createBucketIfNotExists() {
    const bucket = this.templates.create.Resources[this.getBucketId()].Properties;
    const foundBucket = await this.provider.getBucket(bucket.BucketName);
    if (foundBucket) {
      this.serverless.cli.log(`Bucket ${bucket.BucketName} already exists.`);
    } else {
      this.serverless.cli.log(`Creating bucket ${bucket.BucketName}...`);
      await this.provider.createBucket(bucket.BucketName);
      await this.setBucketWebsite(bucket.BucketName);
      await this.setBucketPublic(bucket.BucketName);
      this.serverless.cli.log(`Created bucket ${bucket.BucketName}`);
    }

    this.provider.resetOssClient(bucket.BucketName);
  }
  /**
   * Uploads the files in the client default directory
   */
  async uploadArtifacts() {
    const objectId = this.getBucketId();
    const filesFolder = this.options.distributionFolder || 'client/dist/';
    const files = read(filesFolder);

    const objects = files.map((file) => {
      return {
        ObjectName: file.replace(filesFolder,''),
        LocalPath: file
      };
    });

    const bucket = this.templates.create.Resources[objectId].Properties;

    this.serverless.cli.log(`Uploading objects to OSS bucket ${bucket.BucketName}...`);
    await Promise.all(objects.map((object) => this.provider.uploadObject(object.ObjectName, object.LocalPath)));
    this.serverless.cli.log(`Uploaded objects to OSS bucket ${bucket.BucketName}`);
  }
  
}

/**
 * Reads the contents of a folder recursively
 * 
 * @param {string} dir 
 */
const read = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(read(path.join(dir, file))) :
        files.concat(path.join(dir, file)),
      []);

module.exports = AliyunOss;

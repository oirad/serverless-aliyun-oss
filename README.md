# Aliyun OSS static files upload for serverless

## Installation

```
npm install --save serverless-aliyun-oss
```

## Dependencies

This plugin needs [serverless-aliyun-function-compute](https://github.com/aliyun/serverless-aliyun-function-compute/) installed and configured to be able to interact with Aliyun.

## Notice on usage in Mainland China

Even if the files are uploaded to OSS, they are not usable right away, a CDN needs to be bound to it to be able to access them directly as indicated [in an Aliyun communication](https://www.alibabacloud.com/notice/oss0813). 

Other regions, such as HongKong allow direct access to the files as normal HTML pages.

## Usage

**First,** update your `serverless.yml` by adding the following:

```yaml
plugins:
  - serverless-aliyun-function-compute
  - serverless-aliyun-oss
```

**Second**, Create a website folder in the root directory of your Serverless project. This is where your distribution-ready website should live. By default the plugin expects the files to live in a folder called `client/dist`. But this is configurable with the `distributionFolder` option (see the [Configuration Parameters](#configuration-parameters) below).

The plugin uploads the entire `distributionFolder` to S3 and configures the bucket to host the website and make it publicly available, also setting other options based the [Configuration Parameters](#configuration-parameters) specified in `serverless.yml`.

**Third**, run the plugin, and visit your new website!

```
serverless client deploy
```

**WARNING:** The plugin will overwrite any data you have in the bucket name you set above if it already exists.

If later on you want to take down the website you can use:

```bash
serverless client remove
```

### Configuration Parameters

**domain**

_optional_, default `null`

```yaml
custom:
  client:
    domain: example.com
```

Use this parameter to specify the domain used for the CDN configuration to allow access to the OSS static site.
If not specified, no CDN will be created.

**bucketName**

_optional_, default: `sls-{aliyun_account_id}-client`

```yaml
custom:
  client:
    bucketName: unique-oss-bucketname
```

Use this parameter to specify a unique name for the OSS bucket that your files will be uploaded to.

---

**distributionFolder**

_optional_, default: `client/dist`

```yaml
custom:
  client:
    ...
    distributionFolder: path/to/files
    ...
```

Use this parameter to specify the path that contains your website files to be uploaded. This path is relative to the path that your `serverless.yaml` configuration files resides in.

---

**indexDocument**

_optional_, default: `index.html`

```yaml
custom:
  client:
    ...
    indexDocument: file-name.ext
    ...
```

The name of your index document inside your `distributionFolder`. This is the file that will be served to a client visiting the base URL for your website.

---

**errorDocument**

_optional_, default: `error.html`

```yaml
custom:
  client:
    ...
    errorDocument: file-name.ext
    ...
```

### CLI Parameters

The region can be specified as a CLI parameter, like for the `serverless-aliyun-function-compute` plugin.

For example:

```bash
serverless client deploy --region cn-hongkong
```

## Acknowledgements

This package has been inspired by [serverless-finch](https://github.com/fernando-mc/serverless-finch/) and uses a similar configuration.
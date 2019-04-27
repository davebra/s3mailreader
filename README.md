# s3mailreader

List contents of an S3 bucket 'folder'. Node.js module and command line executable.

![travis-ci build](https://travis-ci.org/davebra/s3mailreader.svg?branch=master)

## Screenshot

![s3mailreader preview](https://raw.githubusercontent.com/davebra/s3mailreader/master/screenshot.jpg)

## Install

```bash
npm i -g s3mailreader
```

## Usage

```bash
s3mailreader -b bucketname
```

By default s3mailreader uses the ~/.aws/config and ~/.aws/credentials settings and use the root of the bucket, the default port is 8003.

You can customise the settings adding them as parameters in the command:

```bash
s3mailreader -b bucketname -d directory -r awsregion -k credentialprofile -a accessid -s secretkey -p PORT
```

## Parameters

- `-b, --bucket` - Required. The S3 bucket name
- `-d, --directory` - Directory to use, by default is uses the root
- `-r, --region` - The AWS region to uses. Required of no ~/.aws/config is found
- `-k, --credentials` - The profile to use from ~/.aws/credentials, by default it uses 'default'
- `-a, --accessid` - The AWS IAM accessKeyId. Required of no ~/.aws/credentials is found
- `-s, --secretkey` - The AWS IAM secretAccessKey. Required of no ~/.aws/credentials is found
- `-p, --port` - The port to listen the service, by default is 3333

## Changelog

#### v1.0.0

- First release

## Author

Davide Bragagnolo - [davebra.me](https://davebra.me)
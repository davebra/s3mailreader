# s3mailreader

s3mailreader is a simple mail-client application that reads emails-MIME files from an S3 bucket. 

Why I need it? Imagine you have your new domain/service setup and you need a really simple mailbox, who needs a server when you can have it with AWS services, with SES Receipt Rules, go serverless! But, in the end you have just a bunch of MIME files, not really easy to read. So, s3mailreader can help you, it opens the MIME-email files, parses, and shows in a lightweight single web app. You can also download the attachments!

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

#### v1.1.0

- Serve CSS and JS from local npm_modules instead of CDN
- Switch to Boostrap

#### v1.0.0

- First release

## Author

Davide Bragagnolo - [davebra.me](https://davebra.me)
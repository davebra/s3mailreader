# s3mailreader

List contents of an S3 bucket 'folder'. Node.js module and command line executable.

# Install

```bash
npm i -g s3mailreader
```

# Usage

```bash
s3mailreader -b bucketname [-d directory -r awsregion -k credentialprofile -a accessid -s secretkey -p PORT]
```

By default s3mailreader uses the ~/.aws/config and ~/.aws/credentials settings, you can override them passing the optional paramenters

# Parameters

- `-b, --bucket` - Required. The S3 bucket name
- `-d, --directory` - Directory to use, by default is uses the root
- `-r, --region` - The AWS region to uses. Required of no ~/.aws/config is found
- `-k, --credentials` - The profile to use from ~/.aws/credentials, by default it uses 'default'
- `-a, --accessid` - The AWS IAM accessKeyId. Required of no ~/.aws/credentials is found
- `-s, --secretkey` - The AWS IAM secretAccessKey. Required of no ~/.aws/credentials is found
- `-p, --port` - The port to listen the service, by default is 3333

# CHANGELOG

## v1.0.0

- First release

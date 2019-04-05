#!/usr/bin/env node

process.env.AWS_SDK_LOAD_CONFIG = true;

// Native
const path = require('path');
const fs = require('fs');

// Packages
const express = require('express');
const _ = require('lodash');
const AWS = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
const argv = require('yargs')
    .option('b', {
        alias: 'bucket',
        demandOption: true,
        describe: 'name of the bucket',
        type: 'string'
    })
    .option('c', {
        alias: 'config',
        demandOption: false,
        describe: 'AWS config profile',
        default: 'default',
        type: 'string'
    })
    .option('k', {
        alias: 'credentials',
        demandOption: false,
        describe: 'AWS credentials profile',
        default: 'default',
        type: 'string'
    })
    .option('r', {
        alias: 'region',
        demandOption: false,
        describe: 'region of you S3 bucket, e.g. "ap-south-2"',
        default: '',
        type: 'string'
    })
    .option('a', {
        alias: 'accessid',
        demandOption: false,
        describe: 'IAM AWS accessKeyId with S3 read permissions',
        type: 'string'
    })
    .option('s', {
        alias: 'secretkey',
        demandOption: false,
        describe: 'IAM AWS secretAccessKey for the accessKeyId',
        type: 'string'
    })
    .option('d', {
        alias: 'directory',
        demandOption: false,
        default: '/',
        describe: 'directory of the bucket to use',
        type: 'string'
    })
    .option('p', {
        alias: 'port',
        demandOption: false,
        default: 3333,
        describe: 'port where the web server listen',
        type: 'int'
    }).argv;

    
if (typeof AWS.config.region === "undefined"){
    if (argv.region.length > 0 && ["us-east-2","us-east-1","us-west-1","us-west-2","ap-south-1","ap-northeast-3","ap-northeast-2","ap-southeast-1","ap-southeast-2","ap-northeast-1","ca-central-1","cn-north-1","cn-northwest-1","eu-central-1","eu-west-1","eu-west-2","eu-west-3","eu-north-1","sa-east-1"].includes(argv.region)){
        AWS.config.update({region: argv.region});
    } else {
        console.error('Error: missing or invalid AWS region'); 
        process.exit(1);
    } 
}

const awsCred = new AWS.SharedIniFileCredentials({profile: argv.credentials});
if (awsCred.accessKeyId === undefined) {
    if (typeof argv.accessid === "undefined" &&
        typeof argv.secretkey === "undefined"
        ){
        AWS.config.update({accessKeyId: argv.accessid, secretAccessKey: argv.secretkey});
    } else {
        console.error('Error: invalid AWS credentials'); 
        process.exit(1);
    }
} else {
    AWS.config.credentials = awsCred;
}

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const port = argv.port || 3000;
const app = express();
const router = require('express').Router();

// list files inside the bucket/directory
router.get('/', async (req, res) => {

    const request = {
        Bucket: argv.bucket,
        Delimiter: '/',
        Prefix: argv.directory + '/' || "/",
    };

    try {

        const data = await s3.listObjects(request).promise();
        console.log(data);

        //email.attachments[0].content.toString()

        //mailHtml = fs.readFileSync(path.join(__dirname, '../wispmail/', 'welcome.html'), {encoding:'utf-8'});
        
        //const templateFn = _.template(mailHtml);

        //const mailHtmlTemplate = templateFn({ 'name': name, 'password': pass });

        return res.send(data.Contents);

    } catch (Error) {
        return res.send(Error.stack);
    }

});

// open a specific file
router.get('/:filename', async (req, res) => {

    const request = {
        Bucket: argv.bucket,
        Key: argv.directory + '/' + req.params.filename,
    };

    try {

        const data = await s3.getObject(request).promise();
        const email = await simpleParser(data.Body);

        // email.attachments[0].content.toString()

        return res.send(email);

    } catch (Error) {
        return res.send(Error.stack);
    }

});

app.use('/', router);

app.listen(port, function () {
    console.log("Running SesS3MimeMailClient on port " + port);
});
#!/usr/bin/env node

process.env.AWS_SDK_LOAD_CONFIG = true;

// Native
const path = require('path');

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
        default: 8003,
        describe: 'web application port to use',
        type: 'int'
    }).argv;

// check if region is passed as argument and is valid, otherwise check if is available a region in the ~/.aws/config 
if(typeof argv.region !== "undefined"){
    if (["us-east-2","us-east-1","us-west-1","us-west-2","ap-south-1","ap-northeast-3","ap-northeast-2","ap-southeast-1","ap-southeast-2","ap-northeast-1","ca-central-1","cn-north-1","cn-northwest-1","eu-central-1","eu-west-1","eu-west-2","eu-west-3","eu-north-1","sa-east-1"].includes(argv.region)){
        AWS.config.update({region: argv.region});
    } else {
        console.error('Error: invalid AWS region'); 
        process.exit(1);
    }
} else if (typeof AWS.config.region === "undefined") {
    console.error('Error: missing AWS region in your configuration, check your .aws/config file or pass the region as argument'); 
    process.exit(1);
}

// check if accessKeyId/secretAccessKey are passed as arguments, otherwise check if is has been loaded a ~/.aws/credentials file with valid profile
if (typeof argv.accessid !== "undefined" && typeof argv.secretkey !== "undefined"){
    AWS.config.update({accessKeyId: argv.accessid, secretAccessKey: argv.secretkey});
} else {
    const awsCred = new AWS.SharedIniFileCredentials({profile: argv.credentials});
    if (awsCred.accessKeyId === undefined) {
        console.error('Error: invalid AWS credentials, check your .aws/credentials file or pass the accessKeyId/secretAccessKey as arguments'); 
        process.exit(1);
    } else {
        AWS.config.credentials = awsCred;
    }
}

// initialize components
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const port = argv.port || 3000;
const app = express();
const router = express.Router();

// list files inside the bucket/directory
router.get('/list', async (req, res) => {

    // prepare s3 request object
    const request = {
        Bucket: argv.bucket,
        Delimiter: '/',
        Prefix: argv.directory + '/' || "/",
    };

    try {
        // get the list of the files inside the folder
        const data = await s3.listObjects(request).promise();

        // return the obj array of files
        res.send(data.Contents);
    } catch (e) {
        console.log(e);
        res.status(500).end();
    }

});

// open a specific mail-file
router.get('/mail/:encfilekey', async (req, res) => {

    // the filekey could have the directory (e.g. folder/filehash)
    // to avoid router errors the filekey is base64 encoded

    // prepare s3 request object
    const request = {
        Bucket: argv.bucket,
        Key: Buffer.from(req.params.encfilekey, 'base64').toString(),
    };

    try {
        
        // get and parse the email from s3
        const data = await s3.getObject(request).promise();
        var email = await simpleParser(data.Body);

        // if there are attachments, remove the attachment content (avoid to send to the browser the content of email's attachments)
        if ( typeof email.attachments !== 'undefined' ){
            for (index = 0; index < email.attachments.length; ++index) {
                delete email.attachments[index].content;
            }
        }

        // return the email json obj
        res.send(email);

    } catch (e) {
        console.log(e);
        res.status(500).end();
    }

});

// download a specific attachment of a mail-file
router.get('/mail/:encfilekey/:checksum', async (req, res) => {

    // the filekey could have the directory (e.g. folder/filehash)
    // to avoid router errors the filekey is base64 encoded

    // prepare s3 request object
    const request = {
        Bucket: argv.bucket,
        Key: Buffer.from(req.params.encfilekey, 'base64').toString(),
    };

    try {

        // get and parse the email from s3
        const data = await s3.getObject(request).promise();
        const email = await simpleParser(data.Body);
        let file;

        // foreach attachments, check which one has been requested and save it on a variable
        if ( typeof email.attachments !== 'undefined' ){
            for (index = 0; index < email.attachments.length; ++index) {
                if( req.params.checksum === email.attachments[index].checksum ){
                    file = email.attachments[index];
                    break;
                }                
            }
        }

        // attachments are saved as buffer in s3
        const fileContent = Buffer.from(file.content);

        // return the file, browsers should download it
        res.writeHead(200, {
            'Content-Type': file.contentType,
            'Content-Disposition': 'attachment; filename=' + file.filename,
            'Content-Length': fileContent.length
        });
        res.end(fileContent);

    } catch (e) {
        console.log(e);
        res.status(500).end();
    }

});

// return the webapp template
router.get('/', async (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, 'src/') })
});

// set the expressjs routes
app.use('/', router);

// set the static files from node_modules
app.use('/node_modules', express.static(path.join(__dirname, '/../node_modules')));

// start the expressjs server on the port
app.listen(port, function () {
    console.log("s3mailreader is running on port " + port);
});
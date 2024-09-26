"use strict";

const AWS = require('aws-sdk');

const spacesEndpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com');
const s3 = new AWS.S3({endpoint: spacesEndpoint, accessKeyId: process.env.SPACES_KEY, secretAccessKey: process.env.SPACES_SECRET});

const SPACES_FOLDER = process.env.SPACES_FOLDER;
const IMAGEURL = `https://images.circlefight.com/${SPACES_FOLDER}`;

// Upload parameters for the upload method only
const uploadParams = {
  Bucket: `circlefight/${SPACES_FOLDER}`,
  ContentType: "image/jpeg",
  ACL: "public-read",
};

// Delete parameters for the delete method only
const deleteParams = {
  Bucket: `circlefight/${SPACES_FOLDER}`,
};

/* Errors can occur and I'm currently not handling them, I probably should, just in case.
The following links are useful for error handling techniques:
https://www.digitalocean.com/docs/spaces/resources/s3-sdk-examples/
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#send-property */


module.exports = {
  IMAGEURL,
  upload: (filename, fileContent) => {
    uploadParams.Key = filename;
    uploadParams.Body = fileContent;
    return s3.putObject(uploadParams).promise();
  },
  delete: (filename) => {
    deleteParams.Key = filename;
    return s3.deleteObject(deleteParams).promise();
  }
};
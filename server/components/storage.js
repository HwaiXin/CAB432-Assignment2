require('dotenv').config();
const axios = require('axios');
const redis = require('redis');
var AWS = require('aws-sdk');

// unique bucket name
const bucketName = 'mr-cab432-storage';

// create and connect redis client to local instance.
const redisClient = redis.createClient();

// Print redis errors to the console
redisClient.on('error', (err) => {
  console.log("Error " + err);
});

//Function that stores a key in Redis
function storeRedis(key, data) {
  redisClient.setex(key, 3600, JSON.stringify({data}));
}

//Function that stores a key in S3
function storeS3(key, data) {
  const body = JSON.stringify({data});
  const objectParams = {Bucket: bucketName, Key: key, Body: body};
  const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
  // Store in S3
  uploadPromise.then(function(data) {
    console.log("Successfully uploaded data to " + bucketName + "/" + key);
  });
}

module.exports = { bucketName, redisClient, storeRedis, storeS3 };


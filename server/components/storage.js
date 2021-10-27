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

//Function that checks if key exists in Redis/S3, return null if not stored anywhere
export default function checkStorage(key) {
  const params = { Bucket: bucketName, Key: key};

  //Check redis for cache key
  return redisClient.get(key, (err, result) => {
    //If that key exist in Redis store
    if (result) 
    {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    }
    else 
    { 
      // Check S3 bucket
      return new AWS.S3({apiVersion: '2006-03-01'}).getObject(params, (err, result) => {
        // If key exists in S3
        if (result) 
        {
          // Serve from S3
          const resultJSON = JSON.parse(result.Body);
          const {source, ...resultRedisJSON} = resultJSON;
          // Store in cache
          storeRedis(key, resultRedisJSON);
          return res.status(200).json(resultJSON);
        }
        //If key has not been stored anywhere
        else 
        {
          return null;
          // Serve directly from Twitter API and store
          //-------CHANGE THIS PART--------//
          return axios.get(searchUrl)
            .then(response => {
              const responseJSON = response.data;
              //Store in S3
              storeS3(key, responseJSON);
              // Store in cache
              storeRedis(key, responseJSON);

              //------CHANGE THIS PART-------//
              return res.status(200).json({ source: 'Twitter API', ...responseJSON, });
          })
          .catch(err => {
          return res.json(err);
          });
        }
      });
    }
  });
}

//Function that stores a key in Redis
function storeRedis(key, data) {
  redisClient.setex(key, 3600, JSON.stringify({ source: 'Redis Cache', ...data, }));
}

//Function that stores a key in S3
function storeS3(key, data) {
  const body = JSON.stringify({ source: 'S3 Bucket', ...data});
  const objectParams = {Bucket: bucketName, Key: key, Body: body};
  const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
  // Store in S3
  uploadPromise.then(function(data) {
    console.log("Successfully uploaded data to " + bucketName + "/" + key);
  });
}

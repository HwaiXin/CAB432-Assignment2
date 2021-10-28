var express = require("express");
var router = express.Router();
const axios = require("axios");
var storage = require("../components/storage");
const redis = require("redis");
var AWS = require("aws-sdk");

var natural = require("natural");
var Analyzer = natural.SentimentAnalyzer;
var stemmer = natural.PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

// Set Authorization bearer for all axios requests
axios.defaults.headers.common = {
  authorization: `Bearer ${process.env.TWITTER_BEARER}`,
};

/* GET Request */
// Params: search - Search query to send to Twitter API.
// Returns array of objects. Includes tweet, sentiment score, sentiment score as text and created date
router.get("/:search", async function (req, res, next) {
  let { search } = req.params;
  let results = [];
  const params = { Bucket: storage.bucketName, Key: search };

  // Serve directly from Twitter API and store in Redis and S3
  return axios
    .get(
      `https://api.twitter.com/2/tweets/search/recent?query=${search} lang:en&tweet.fields=created_at`
    )
    .then((response) => {
      const apiData = response.data.data;

      apiData.forEach((tweet) => {
        let text = tweet.text; // Get text from returned tweet
        let created_at = tweet.created_at; // Get ISO creation date
        // Scores scale from -5 to +5
        let score = analyzer.getSentiment(text.split(" ")); // Get sentiment score. Split string into word array.
        if (text != undefined && score != undefined) {
          results.push({
            text,
            score,
            scoreText: scoreToString(score),
            created_at,
          });
        }
      });

      //Check redis for key
      storage.redisClient.get(search, (err, result) => {
        //If that key exist
        if (result) {
          //Serve data from Redis along with current data
          const json = JSON.parse(result);
          const resultJSON = json.data.concat(results);
          //Store new data
          storage.storeRedis(search, resultJSON);
          storage.storeS3(search, resultJSON);
          res.status(200).json(resultJSON);
        } else {
          console.log("CHECK S3");
          // Check S3 bucket
          new AWS.S3({ apiVersion: "2006-03-01" }).getObject(
            params,
            (err, result) => {
              // If key exists
              if (result) {
                // Serve from S3
                const json = JSON.parse(result.Body);
                const resultJSON = json.data.concat(results);
                //Store new data
                storage.storeRedis(search, resultJSON);
                storage.storeS3(search, resultJSON);
                res.status(200).json(resultJSON);
              }
              //If key has not been stored anywhere
              else {
                console.log("DATA ONLY FROM API");
                console.log(results);
                //Store new data
                storage.storeRedis(search, results);
                storage.storeS3(search, results);
                res.status(200).json(results);
              }
            }
          );
        }
      });
    })
    .catch((err) => {
      return res.json(err);
    });
});

function scoreToString(score) {
  if (score >= -0.25 && score <= 0.25) {
    return "Neutral";
  } else if (score < -0.25 && score >= -1) {
    return "Negative";
  } else if (score < -1) {
    return "Extremely Negative";
  } else if (score > 0.25 && score <= 1) {
    return "Positive";
  } else {
    return "Extremely Positive";
  }
}

module.exports = router;

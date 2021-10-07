var express = require("express");
var router = express.Router();
const axios = require("axios");
axios.defaults.headers.common = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let apiData = (
      await axios.get(
        `https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev`
      )
    ).data;
    res.status(200).json(apiData);
  } catch (e) {
    console.error(e.response);
    console.log("Bearer", process.env.TWITTER_BEARER);
    res.status(400).json(e);
  }
});

module.exports = router;

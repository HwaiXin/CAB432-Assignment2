var express = require("express");
var router = express.Router();
const axios = require("axios");
var needle = require("needle");

// Set Authorization bearer for all axios requests
axios.defaults.headers.common = {
  authorization: `Bearer ${process.env.TWITTER_BEARER}`,
};

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream";

const rules = [
  {
    value: "dog has:images",
    tag: "dog pictures",
  },
];

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let apiData = (
      await axios.get(
        `https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev`
      )
    ).data;
    console.log(apiData);
    res.status(200).json(apiData);
  } catch (e) {
    console.error(e.response);
    res.status(400).json(e);
  }
});

/* GET home page. */
router.get("/:search", async function (req, res, next) {
  let search = req.params.search;
  try {
    let apiData = (
      await axios.get(
        `https://api.twitter.com/2/tweets/search/recent?query=${search}`
      )
    ).data;
    console.log(apiData);
    res.status(200).json(apiData);
  } catch (e) {
    console.error(e.response);
    res.status(400).json(e);
  }
});

router.get("/stream/test", async function (req, res, next) {
  (async () => {
    let currentRules;

    try {
      // Gets the complete list of rules currently applied to the stream
      currentRules = await getAllRules();

      // Delete all rules. Comment the line below if you want to keep your existing rules.
      await deleteAllRules(currentRules);

      // Add rules to the stream. Comment the line below if you don't want to add new rules.
      await setRules();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    // Listen to the stream.
    streamConnect(0);
  })();
});

async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${process.env.TWITTER_BEARER}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.TWITTER_BEARER}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await axios.post(rulesURL, data);

  if (response.status !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

function streamConnect(retryAttempt) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
    },
    timeout: 20000,
  });

  let tweets = {};
  let counter = 0;

  stream
    .on("data", (data) => {
      try {
        const json = JSON.parse(data);
        tweets.push(json);
        counter++;
        console.log(json);
        // A successful connection resets retry count.
        retryAttempt = 0;
        if (counter == 5) stream.destroy();
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data);
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        process.exit(1);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
}

module.exports = router;

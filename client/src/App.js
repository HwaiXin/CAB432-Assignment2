import { useState, useEffect } from "react";
import LineChart from "./components/LineChart";
import Loader from "./components/Loader";
const axios = require("axios");

let apiData;

function App() {
  const [tweets, setTweets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [negative, setNegative] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [positive, setPositive] = useState(0);

  // Run on input change
  function updateSearch(e) {
    setSearch(e.target.value); // Set search to input value
  }

  // Retrieves tweets from API. Passes input string as param.
  async function getTweets(search) {
    try {
      setError(false);
      setLoading(true);
      await axios
        .get(`/api/twitter/${search}`)
        .then((response) => {
          apiData = response.data;
        })
        .catch((error) => {
          console.log("Err", error);
          setErrMsg("Tweets could not be retrieved.");
          setError(true);
        });
      if (Object.keys(apiData).length === 0) {
        setErrMsg("No tweets matched this query.");
        setError(true);
        setLoading(false);
        return;
      }
      let recieivedTweets = [];
      apiData.forEach((t) => {
        recieivedTweets.push({
          text: t.text,
          score: t.score,
          scoreText: t.scoreText,
        });
      });
      recieivedTweets.reverse(); // Reverse order as oldest tweets were displaying first in 'Twitter Feed'
      setTweets(recieivedTweets);
      setLoading(false);
    } catch (e) {
      console.error(e.reponse);
    }
  }

  // Convert Score Text from Tweet object to camelCase. Used for applying css styles to score text. E.g., Neutral, Positive, etc.
  function toCamelCase(string) {
    let str = string.charAt(0).toLowerCase() + string.slice(1);
    return str.replace(/\s/g, "");
  }

  function setPercentage(num) {
    return Math.round(num * 10) / 10;
  }

  // Returns data object in required format for React ChartJS Line Chart
  function getData() {
    return {
      labels: tweets.map((t, index) => ++index),
      datasets: [
        {
          label: "Tweet Analysis",
          data: tweets.map((t) => t.score),
          fill: false,
          backgroundColor: "#1DA1F2",
          borderColor: "#1DA1F2",
        },
      ],
    };
  }

  // Update UI each time tweets state is updated
  // Also calculates percentage of tweets which are Negative, Neutral and Positive
  useEffect(() => {
    if (tweets.length > 0) {
      let neutral = 0, positive = 0, negative = 0;
      tweets.forEach((t) => {
        if (t.scoreText.includes("Negative")) negative++;
        if (t.scoreText === "Neutral") neutral++;
        if (t.scoreText.includes("Positive")) positive++;
      })
  
      setNeutral(setPercentage((neutral / tweets.length) * 100));
      setPositive(setPercentage((positive / tweets.length) * 100));
      setNegative(setPercentage((negative / tweets.length) * 100));
    }
  }, [tweets]);

  return (
    <div className="App">
      <h1>Twitter Sentiment Analysis</h1>
      {/* Search */}
      <div className="search">
        <div className="searchInner">
          <input
            name="query"
            type="text"
            placeholder="Enter a keyword..."
            value={search}
            onChange={(e) => updateSearch(e)}
          />
          <button onClick={() => {
            if (search == null || search.trim() === '') {
              setErrMsg("Please enter something into the search bar!");
              setError(true);
            }
            else {
              getTweets(search)
            }
          }}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div className="scores">
            <h1>Negative <span className="negative">{negative}%</span></h1>
            <h1>Neutral <span className="neutral">{neutral}%</span></h1>
            <h1>Positive <span className="positive">{positive}%</span></h1>
          </div>

      {/* Print Error to screen if query yields no results. */}
      {error ? (
        <h2>{errMsg}</h2>
      ) : // If loading state, dispaly Loader component
        loading ? (
          <Loader />
        ) : (
          // If no error and not loading, show content - Line Graph and Tweets
          <div className="content">
            {/* Line Chart */}
            <div className="chart">
              <LineChart data={getData} />
            </div>
            <div className="tweetBox">
              <h1>Twitter Feed</h1>
              {/* Tweets */}
              {tweets.map((tweet, index) => {
                return (
                  <div key={index} className="tweet">
                    <h3>
                      <i class="fab fa-twitter"></i> {tweet.text}
                    </h3>
                    <h4>
                      Score:{" "}
                      <span className={toCamelCase(tweet.scoreText)}>
                        {tweet.scoreText}
                      </span>
                    </h4>
                    <hr />
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}

export default App;

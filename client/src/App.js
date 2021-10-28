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
          setErrMsg("No tweets match this query");
          setError(true);
        });
      if (Object.keys(apiData).length === 0) {
        setErrMsg("No tweets match this query");
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
  useEffect(() => {}, [tweets]);

  return (
    <div className="App">
      <h1>Twitter Sentiment Analysis</h1>
      {/* Search */}
      <div className="search">
        <label htmlFor="query">Enter a Keyword</label>
        <div className="searchInner">
          <input
            name="query"
            type="text"
            value={search}
            onChange={(e) => updateSearch(e)}
          />
          <button onClick={() => {
            if (search == "" || search.trim() === ''){
              setErrMsg("Please enter something into the search bar!");
              setError(true);
            }
            else{
              getTweets(search)
            }
            }}>
            <i className="fas fa-search"></i>
          </button>
        </div>
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
            <LineChart title="Testing Props" data={getData} />
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

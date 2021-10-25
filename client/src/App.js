import "./App.css";
import { useState, useEffect } from "react";
import LineChart from "./LineChart";
const axios = require("axios");

function App() {
  const [tweets, setTweets] = useState([]);
  const [search, setSearch] = useState("");

  function updateSearch(e) {
    setSearch(e.target.value); // Set search to input value
  }

  async function getTweets(search) {
    try {
      console.log("SEARCH", search);
      let apiData = (await axios.get(
        `http://localhost:3000/api/twitter/${search}`
      )).data;
      console.log('ApiData', apiData)
      let recieivedTweets = [];
      apiData.forEach((t) => {
        recieivedTweets.push({
          text: t.text,
          score: t.score
        });
      });
      setTweets(recieivedTweets);
    } catch (e) {
      console.error(e.reponse);
    }
  }

  function toCamelCase(string) {
    let str = string.charAt(0).toLowerCase() + string.slice(1);
    return str.replace(/\s/g, '');
  }

  useEffect(() => {
    console.log("Tweets updated");
    console.log('Tweets', tweets);
  }, [tweets]);

  return (
    <div className="App">
      <h1>Twitter Sentiment Analysis</h1>

      <div className="content">
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
          <button onClick={() => getTweets(search)}><i class="fas fa-search"></i></button>
          </div>
        </div>
        {/* Tweets */}
        {tweets.map((tweet, index) => {
          return (
            <div key={index} className="tweet">
              <h2><i class="fab fa-twitter"></i> {tweet.text}</h2>
              <h3>Score: <span className={toCamelCase(tweet.score)}>{tweet.score}</span></h3>
            </div>
          );
        })}
      </div>
      {/* <LineChart /> */}
    </div>
  );
}

export default App;

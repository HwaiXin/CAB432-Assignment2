import "./App.css";
import { useState, useEffect } from "react";
const axios = require("axios");

function App() {
  const [tweets, setTweets] = useState([]);
  const [search, setSearch] = useState("");

  function updateSearch(e) {
    setSearch(e.target.value); // Set search to input value
    console.log(search);
  }

  async function getTweets(search) {
    try {
      console.log("SEARCH", search);
      let apiData = await axios.get(
        `http://localhost:3000/api/twitter/${search}`
      );
      let recieivedTweets = [];
      apiData.data.data.forEach((t) => {
        recieivedTweets.push(t.text);
      });
      setTweets((prevTweets) => [...prevTweets, ...recieivedTweets]);
    } catch (e) {
      console.error(e.reponse);
    }
  }

  useEffect(() => {
    console.log("Tweets updated");
    console.log(tweets);
  }, [tweets]);

  return (
    <div className="App">
      <h1>Twitter Something</h1>
      <label htmlFor="query">Enter a name</label>
      <input
        name="query"
        type="text"
        value={search}
        onChange={(e) => updateSearch(e)}
      />
      <button onClick={() => getTweets(search)}>Search!</button>
      {tweets.map((value, index) => {
        return <h3 key={index}>{value}</h3>;
      })}
    </div>
  );
}

export default App;

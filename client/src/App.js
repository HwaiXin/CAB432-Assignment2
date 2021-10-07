import "./App.css";
import { useState, useEffect } from "react";
const axios = require("axios");

function App() {
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");

  function updateSearch(e) {
    setSearch(e.target.value); // Set search to input value
    console.log(search);
  }

  async function getData() {
    try {
      let apiData = (await axios.get(`https://api.agify.io/?name=${search}`))
        .data;
      setData(apiData);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getData();
  }, []);

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
      <button onClick={() => getData()}>Search!</button>
      <h2>Name: {data.name}</h2>
      <h2>Approx Age: {data.age}</h2>
      <h2>Count: {data.count}</h2>
    </div>
  );
}

export default App;

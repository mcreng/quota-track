import React, { Component } from "react";
import ReactChartkick, { LineChart } from "react-chartkick";
import Chart from "chart.js";
import logo from "./logo.svg";
import "./App.css";

ReactChartkick.addAdapter(Chart);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
    this.getData = this.getData.bind(this);
  }

  getData(obj, subjectCode, sectionCode) {
    const times = obj[0];
    const section = obj[1][subjectCode]["sections"][sectionCode];
    const { id, ...data } = section;

    const entries = ["avail", "enrol", "quota", "wait"];
    var graphData = [];
    entries.forEach(entry => {
      var graphDatum = {};
      graphDatum["name"] = entry;
      graphDatum["data"] = {};
      data[entry].forEach((datum, index) => {
        graphDatum["data"][times[index]] = datum;
      });
      graphData.push(graphDatum);
    });
    console.log(graphData);
    this.setState({ data: graphData });
  }

  async componentDidMount() {
    const response = await fetch("/api/data/quota/ACCT");
    const content = await response.json();
    this.getData(content, "1010", "1017");
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <LineChart data={this.state.data} />
      </div>
    );
  }
}

export default App;

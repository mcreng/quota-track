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
  }

  async componentDidMount() {
    const response = await fetch("/api/ACCT/1010/1017");
    console.log(response);
    const content = await response.json();
    this.setState({ data: content });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <LineChart
          data={this.state.data}
          xtitle="Time"
          ytitle="Count"
          title="ACCT 1010 - L1 (1017)"
          legend="right"
          width="40vw"
          height="40vh"
        />
      </div>
    );
  }
}

export default App;

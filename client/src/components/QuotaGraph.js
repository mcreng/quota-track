import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactChartkick, { LineChart } from "react-chartkick";
import Chart from "chart.js";

ReactChartkick.addAdapter(Chart);

class QuotaGraph extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  parseSemesterId(id) {
    const year = "20" + id.slice(0, 2);
    var sem = "";
    switch (id.slice(2)) {
      case "10":
        sem = "Fall";
        break;
      case "20":
        sem = "Winter";
        break;
      case "30":
        sem = "Spring";
        break;
      case "40":
        sem = "Summer";
        break;
      default:
        console.error("Something's wrong in semester id parsing.");
    }
    return year + " " + sem;
  }

  async componentDidMount() {
    var data = await fetch(
      `/api/${this.props.semester}/${this.props.subject}/${this.props.course}/${
        this.props.section
      }`
    );
    data = await data.json();

    var sectionName = await fetch(
      `/api/${this.props.semester}/${this.props.subject}/${this.props.course}`
    );
    sectionName = await sectionName.json();
    sectionName = sectionName[this.props.section];

    this.setState({
      data: data,
      title: `${this.parseSemesterId(this.props.semester)} - ${
        this.props.subject
      }${this.props.course} ${sectionName}`
    });
  }

  render() {
    return (
      <LineChart
        data={this.state.data}
        xtitle="Time"
        ytitle="Count"
        title={this.state.title}
      />
    );
  }
}

QuotaGraph.propTypes = {
  semester: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  course: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired
};

export default QuotaGraph;

import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactChartkick, { LineChart, AreaChart } from "react-chartkick";
import Chart from "chart.js";
import { parseSemesterId } from "../misc";
ReactChartkick.addAdapter(Chart);

class QuotaGraph extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  async componentDidMount() {
    var data = await fetch(
      `/api/${this.props.semester}/${this.props.subject}/${this.props.course}/${
        this.props.section
      }`
    );
    data = await data.json();

    // add quota to wait
    // FIXME: Display would be incorrect since quota is added
    Object.keys(data[3]["data"]).forEach(time => {
      data[3]["data"][time] += data[2]["data"][time];
    });

    // remove avail
    data = data.slice(1);

    var sectionName = await fetch(
      `/api/${this.props.semester}/${this.props.subject}/${this.props.course}`
    );
    sectionName = await sectionName.json();
    sectionName = sectionName[this.props.section];

    this.setState({
      data: data,
      title: `${parseSemesterId(this.props.semester)} - ${this.props.subject}${
        this.props.course
      } ${sectionName}`
    });
  }

  render() {
    return (
      <AreaChart
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

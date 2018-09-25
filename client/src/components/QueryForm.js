import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Select, Button } from "antd";
import { parseSemesterId } from "../misc";

const Option = Select.Option;

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjectDisabled: true,
      courseDisabled: true,
      sectionDisabled: true,
      submitDisabled: true
    };
  }

  componentDidMount() {
    var semesters = ["1810"]; // expose api later
    var semesterOptions = [];
    for (var i = 0; i < semesters.length; i++)
      semesterOptions.push(
        <Option value={semesters[i]} key={i}>
          {parseSemesterId(semesters[i])}
        </Option>
      );
    this.setState({ semesterOptions });
  }

  onSubmit = e => {
    e.preventDefault();
    console.log("onSubmit pressed.");
  };

  handleSemesterChange = async v => {
    var subjects = await fetch(`/api/${v}`);
    subjects = await subjects.json();
    var subjectOptions = [];
    for (var i = 0; i < subjects.length; i++)
      subjectOptions.push(
        <Option value={subjects[i]} key={i}>
          {subjects[i]}
        </Option>
      );
    this.setState({
      semesterValue: v,
      subjectValue: null,
      courseValue: null,
      sectionValue: null,
      semester: v,
      subject: null,
      course: null,
      section: null,
      courseDisabled: true,
      sectionDisabled: true,
      subjectOptions,
      subjectDisabled: false,
      submitDisabled: true
    });
  };

  handleSubjectChange = async v => {
    var courses = await fetch(`/api/${this.state.semester}/${v}`);
    courses = await courses.json();
    var courseOptions = [];
    for (var i = 0; i < courses.length; i++)
      courseOptions.push(
        <Option value={courses[i]} key={i}>
          {courses[i]}
        </Option>
      );
    this.setState({
      subjectValue: v,
      courseValue: null,
      sectionValue: null,
      subject: v,
      course: null,
      section: null,
      courseOptions,
      sectionDisabled: true,
      courseDisabled: false,
      submitDisabled: true
    });
  };
  handleCourseChange = async v => {
    var sections = await fetch(
      `/api/${this.state.semester}/${this.state.subject}/${v}`
    );
    sections = await sections.json();
    var sectionOptions = [];
    for (var i = 0; i < Object.keys(sections).length; i++)
      sectionOptions.push(
        <Option value={Object.keys(sections)[i]} key={i}>
          {Object.values(sections)[i]}
        </Option>
      );
    this.setState({
      courseValue: v,
      sectionValue: null,
      course: v,
      section: null,
      sectionOptions,
      sectionDisabled: false,
      submitDisabled: true
    });
  };

  handleSectionChange = async v => {
    console.log(
      `Course chosen: ${this.state.semester} ${this.state.subject} ${
        this.state.course
      } ${v}`
    );
    this.setState({ sectionValue: v, section: v, submitDisabled: false });
  };

  render() {
    return (
      <div>
        <Row>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            Semester
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            Subject
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            Course
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            Section
          </Col>
        </Row>
        <Row>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            <Select
              className="semester-select"
              onChange={this.handleSemesterChange}
              value={this.state.semesterValue}
              style={{ width: "100%" }}
            >
              {this.state.semesterOptions}
            </Select>
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            <Select
              className="subject-select"
              onChange={this.handleSubjectChange}
              disabled={this.state.subjectDisabled}
              value={this.state.subjectValue}
              style={{ width: "100%" }}
            >
              {this.state.subjectOptions}
            </Select>
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            <Select
              className="course-select"
              onChange={this.handleCourseChange}
              disabled={this.state.courseDisabled}
              value={this.state.courseValue}
              style={{ width: "100%" }}
            >
              {this.state.courseOptions}
            </Select>
          </Col>
          <Col lg={{ span: 3, offset: 2 }} sm={{ span: 3, offset: 1 }}>
            <Select
              className="section-select"
              onChange={this.handleSectionChange}
              disabled={this.state.sectionDisabled}
              value={this.state.sectionValue}
              style={{ width: "100%" }}
            >
              {this.state.sectionOptions}
            </Select>
          </Col>
          <Col lg={4} sm={8} align="center">
            <Button
              type="primary"
              onClick={this.onSubmit}
              disabled={this.state.submitDisabled}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default QueryForm;

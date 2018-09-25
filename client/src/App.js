import React, { Component } from "react";
import { Layout, Row, Col } from "antd";
import QuotaGraph from "./components/QuotaGraph";
import "./App.css";
import QueryForm from "./components/QueryForm";

const { Header, Content, Footer } = Layout;
class App extends Component {
  render() {
    return (
      <div className="App">
        <Header className="App-header">
          <p>Hi</p>
        </Header>
        <Content className="App-content">
          <div>
            <QueryForm />
            <Row>
              <Col lg={12} sm={24}>
                <QuotaGraph
                  semester="1810"
                  subject="SOSC"
                  course="1960"
                  section="3753"
                />
              </Col>
              <Col lg={12} sm={24}>
                <QuotaGraph
                  semester="1810"
                  subject="ISOM"
                  course="2700"
                  section="2564"
                />
              </Col>
              <Col lg={12} sm={24}>
                <QuotaGraph
                  semester="1810"
                  subject="COMP"
                  course="3711H"
                  section="1928"
                />
              </Col>
              <Col lg={12} sm={24}>
                <QuotaGraph
                  semester="1810"
                  subject="LANG"
                  course="2030"
                  section="2929"
                />
              </Col>
            </Row>
          </div>
        </Content>
        <Footer className="App-footer">
          Made by React, Express and NodeJS
        </Footer>
      </div>
    );
  }
}

export default App;

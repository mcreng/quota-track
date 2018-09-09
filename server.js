const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const logger = require("./logger")("api");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  logger.info("Selected timeout: ", req.body.timeout);
  fetchCourses(req.body.timeout).then(res.status(200).send({ done: true }));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

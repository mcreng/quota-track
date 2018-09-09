const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const logger = require("./logger")("api");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  res.status(200).send({ received: true });
});

setInterval(() => fetchCourses(1000), 1000 * 60 * 15);

app.listen(port, () => console.log(`Listening on port ${port}`));

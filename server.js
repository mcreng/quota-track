const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const logger = require("./logger")("api");
const jsonfile = require("jsonfile");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  res.status(200).send({ received: true });
});

/**
 * GET
 * @param subject - Subject Name
 */
app.route("/api/data/quota").get((req, res) => {
  res
    .status(200)
    .sendFile(`./data/quota/${req.body.subject}.json`, { root: "." });
});

// Fetch once, then after so, fetch again per 60 minutes
// fetchCourses(1000).then(setInterval(() => fetchCourses(1000), 1000 * 60 * 60));

app.listen(port, () => console.log(`Listening on port ${port}`));

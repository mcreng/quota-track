const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const schedule = require("node-schedule");
const logger = require("./logger")("api");
const jsonfile = require("jsonfile");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return a.indexOf(i) < 0;
  });
};

app.route("/api").get((req, res) => {
  logger.log("/api called.");
  res.status(200).send({ received: true });
});

/**
 * GET Subject Quota JSON
 * @param subject - Subject Name
 */
app.route("/api/data/quota/:subject").get((req, res) => {
  logger.info(
    `/api/data/quota called with ${req.params.subject}.json requested.`
  );
  const times = jsonfile.readFileSync("./data/times.json");
  const data = jsonfile.readFileSync(`./data/quota/${req.params.subject}.json`);
  res.json([times, data]);
});

// Fetch once, then after so, fetch again per 60 minutes

// fetchCourses(1000).then(setInterval(() => fetchCourses(1000), 1000 * 60 * 60));
schedule.scheduleJob("0 0,30 * * * *", fireDate => {
  logger.info(`fetchcourse() fired at ${fireDate}`);
  fetchCourses(1000);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

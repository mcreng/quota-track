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
 * GET List of subjects
 */
app.route("/api/subjects").get((req, res) => {
  logger.info("/api/subjects called.");
  const subjects = jsonfile.readFileSync("./data/subjects.json");
  res.json(subjects);
});

/**
 * GET List of courses
 * @param subject Subject name, for example 'ACCT'
 */
app.route("/api/:subject/courses").get((req, res) => {
  logger.info(`/api/${req.params.subject}/courses called.`);
  const subject = jsonfile.readFileSync(
    `./data/info/${req.params.subject}.json`
  );
  const courses = Object.keys(subject);
  res.json(courses);
});

/**
 * GET List of section codes
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 */
app.route("/api/:subject/:course/sections").get((req, res) => {
  logger.info(
    `/api/${req.params.subject}/${req.params.course}/sections called.`
  );
  const subject = jsonfile.readFileSync(
    `./data/info/${req.params.subject}.json`
  );
  const codes = Object.keys(subject[req.params.course]["sections"]).map(key => {
    return { [key]: subject[req.params.course]["sections"][key]["code"] };
  });
  res.json(codes);
});

/**
 * GET List of section codes
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 * @param section Section id, for example '1017' which corresponds to L1
 */
app.route("/api/:subject/:course/:section").get((req, res) => {
  logger.info(
    `/api/${req.params.subject}/${req.params.course}/${
      req.params.section
    } called.`
  );
  const times = jsonfile.readFileSync("./data/times.json");
  var data = jsonfile.readFileSync(`./data/quota/${req.params.subject}.json`);
  // remove id
  var { id, ...data } = data[req.params.course]["sections"][req.params.section];

  const entries = ["avail", "enrol", "quota", "wait"];
  var graphData = [];
  // make into appropriate format
  entries.forEach(entry => {
    var graphDatum = {};
    graphDatum["name"] = entry;
    graphDatum["data"] = {};
    data[entry].forEach((datum, index) => {
      graphDatum["data"][times[index]] = datum;
    });
    graphData.push(graphDatum);
  });
  res.json(graphData);
});

// fetch per :00 and :30 and first during deploy
schedule.scheduleJob("0 0,30 * * * *", fireDate => {
  logger.info(`fetchCourses() fired at ${fireDate}`);
  fetchCourses(1000);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

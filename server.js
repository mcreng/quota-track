const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const schedule = require("node-schedule");
const logger = require("./logger")("api");
const jsonfile = require("jsonfile");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

/**
 * Find the difference between two arrays
 * @param {Array} a Another array to compare to
 * @example a.diff(b) - finds the difference in entry between a and b
 */
Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return a.indexOf(i) < 0;
  });
};

/**
 * GET List of subjects
 * @param semester Semester id, for example '1810'
 */
app.route("/api/:semester/").get((req, res) => {
  logger.info(`/api/${req.params.semester} called.`);
  const subjects = jsonfile.readFileSync(
    `./data/${req.params.semester}/subjects.json`
  );
  res.json(subjects);
});

/**
 * GET List of courses
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 */
app.route("/api/:semester/:subject/").get((req, res) => {
  logger.info(`/api/${req.params.semester}/${req.params.subject} called.`);
  const subject = jsonfile.readFileSync(
    `./data/${req.params.semester}/info/${req.params.subject}.json`
  );
  const courses = Object.keys(subject);
  res.json(courses);
});

/**
 * GET List of section codes
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 */
app.route("/api/:semester/:subject/:course/").get((req, res) => {
  logger.info(
    `/api/${req.params.semester}/${req.params.subject}/${
      req.params.course
    } called.`
  );
  const subject = jsonfile.readFileSync(
    `./data/${req.params.semester}/info/${req.params.subject}.json`
  );
  var codes = {};
  Object.keys(subject[req.params.course]["sections"]).forEach(key => {
    codes[key] = subject[req.params.course]["sections"][key]["code"];
  });
  res.json(codes);
});

/**
 * GET List of section codes
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 * @param section Section id, for example '1017' which corresponds to L1
 */
app.route("/api/:semester/:subject/:course/:section").get((req, res) => {
  logger.info(
    `/api/${req.params.semester}/${req.params.subject}/${req.params.course}/${
      req.params.section
    } called.`
  );
  const times = jsonfile.readFileSync(
    `./data/${req.params.semester}/times.json`
  );
  var data = jsonfile.readFileSync(
    `./data/${req.params.semester}/quota/${req.params.subject}.json`
  );
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
// format: second minute hour day month day-of-week
// schedule.scheduleJob("0 0,15,30,45 * * * *", fireDate => {
//   logger.info(`fetchCourses() fired at ${fireDate}`);
//   fetchCourses(1000);
// });
app.listen(port, () => logger.info(`Listening on port ${port}`));

const express = require("express");
const bodyParser = require("body-parser");
const fetchCourses = require("./fetch");
const schedule = require("node-schedule");
const logger = require("./logger")("api");
const jsonfile = require("jsonfile");
const util = require("util");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

let jobs = [];

/**
 * Find the difference between two arrays
 * @param {Array} a Another array to compare to
 * @example a.diff(b) - finds the difference in entry between a and b
 */
Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};

/**
 * POST Scrape configuration
 *
 * @param apiKey API key for updating configuration
 * @param config Configuration list, each object in list should include
 *               - start, task start time
 *               - end,   task end time
 *               - per,   interval in minutes
 */
app.route("/api/config").post((req, res) => {
  if (req.body.apiKey !== process.env.apiKey) {
    res.sendStatus(401);
  } else {
    let config = req.body.config;
    if (config === null || config === undefined) {
      // Cancel all current jobs
      jobs.forEach(el => el.cancel());
      return res.json({ cleared: true });
    }

    // Check if invalid
    for (rule of config) {
      console.log(rule);
      if (
        rule.start === null ||
        rule.start === undefined ||
        rule.end === null ||
        rule.end === null ||
        !Number.isInteger(rule.per)
      ) {
        return res.sendStatus(400);
      }
    }

    // Map each config json into json that schedule takes
    config = config.map(rule => {
      return {
        start: new Date(rule.start),
        end: new Date(rule.end),
        rule: `0 */${rule.per} * * * *`
      };
    });

    logger.info(
      `Got scheduling request: ${util.inspect(config, false, null, true)}`
    );

    // Cancel all current jobs
    jobs.forEach(el => el.cancel());

    // Add new job
    for (rule of config) {
      jobs.push(
        schedule.scheduleJob(rule, fireDate => {
          logger.info(`fetchCourses() fired at ${fireDate}`);
          fetchCourses(1000);
        })
      );
    }
    return res.json({ done: true });
  }
});

/**
 * GET List of subjects
 * @param semester Semester id, for example '1810'
 */
app.route("/api/:semester/").get((req, res) => {
  try {
    logger.info(`/api/${req.params.semester} called.`);
    const subjects = jsonfile.readFileSync(
      `./data/${req.params.semester}/subjects.json`
    );
    res.json(subjects);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * GET List of courses
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 */
app.route("/api/:semester/:subject/").get((req, res) => {
  try {
    logger.info(`/api/${req.params.semester}/${req.params.subject} called.`);
    const subject = jsonfile.readFileSync(
      `./data/${req.params.semester}/info/${req.params.subject}.json`
    );
    const courses = Object.keys(subject);
    res.json(courses);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * GET List of section codes
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 */
app.route("/api/:semester/:subject/:course/").get((req, res) => {
  try {
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
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * GET List of section codes
 * @param semester Semester id, for example '1810'
 * @param subject Subject name, for example 'ACCT'
 * @param course Course code, for example '1010'
 * @param section Section id, for example '1017' which corresponds to L1
 */
app.route("/api/:semester/:subject/:course/:section").get((req, res) => {
  try {
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
    var { id, ...data } = data[req.params.course]["sections"][
      req.params.section
    ];

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
  } catch (error) {
    res.sendStatus(404);
  }
});

app.listen(port, () => logger.info(`Listening on port ${port}`));

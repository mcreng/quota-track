const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const moment = require("moment");
const logger = require("./logger")("fetcher");
const { extractBasicInfo, extractQuotaInfo } = require("./extractInfo");
const { Course } = require("./course");

const domain = "https://w5.ab.ust.hk/";
const uri = "https://w5.ab.ust.hk/wcq/cgi-bin/";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms)); // Sleep function in ms

/**
 * Fetch information from ARRO website
 * @param {Integer} timeout - Timeout per request in ms
 */
const fetchCourses = timeout =>
  request({
    uri: uri,
    transform: (body, response) => {
      return [response, cheerio.load(body)];
    }
  })
    .then(([response, $]) => {
      const semester = response.request.uri.href.match(/\d{4}/g)[0];
      const depts = $(".depts")
        .find("a")
        .map((index, el) => {
          var obj = {};
          obj["subject"] = $(el).text();
          obj["href"] = domain + $(el).attr("href");
          return obj;
        })
        .get();
      const currentTime = moment();
      const currentTimeFormated = moment(currentTime).format("YYMMDDHHmmss");
      fs.existsSync("./data") || fs.mkdirSync("./data");
      fs.existsSync(`./data/${semester}`) || fs.mkdirSync(`./data/${semester}`);
      fs.existsSync(`./data/${semester}/src`) ||
        fs.mkdirSync(`./data/${semester}/src`);
      fs.mkdirSync(`./data/${semester}/src/${currentTimeFormated}/`);

      for (var i = 0; i < depts.length; i++) {
        setTimeout(
          async i => {
            await parseSubject(semester, currentTimeFormated, depts[i]);
            extractBasicInfo(
              semester,
              currentTimeFormated,
              depts[i]["subject"]
            );
            extractQuotaInfo(
              semester,
              currentTimeFormated,
              depts[i]["subject"]
            );
          },
          timeout * i,
          i
        );
      }

      var times = [moment(currentTime).format()];
      if (fs.existsSync(`./data/${semester}/times.json`)) {
        times = JSON.parse(
          fs.readFileSync(`./data/${semester}/times.json`).toString()
        ).concat(times);
      }
      fs.writeFile(
        `./data/${semester}/times.json`,
        JSON.stringify(times),
        {
          mode: 0755
        },
        err => {
          if (err) logger.error(err);
        }
      );
      logger.info(`times.json updated.`);

      fs.writeFile(
        `./data/${semester}/subjects.json`,
        JSON.stringify(depts.map(dept => dept["subject"])),
        {
          mode: 0755
        },
        err => {
          if (err) logger.error(err);
        }
      );
      logger.info(`subjects.json updated.`);
    })
    .catch(logger.error);

/**
 * The entry point of parsing one subject
 * @param {String} semester - Semester id
 * @param {String} time - Current time
 * @param {Object} subject - Subject code and link
 */
function parseSubject(semester, time, subject) {
  return request({
    uri: subject["href"],
    transform: function(body) {
      return cheerio.load(body);
    }
  })
    .then($ => {
      const raw_courses = $("div.course");
      var courses = {};
      for (var i = 0; i < raw_courses.length; i++) {
        const raw_course = $(raw_courses[i]);
        var course = new Course($);
        course
          .parseTitle(raw_course.find("h2").text())
          .parseCourseInfo(raw_course.find(".courseattr .popupdetail")[0])
          .parseSections(raw_course.find(".sections")[0]);
        courses[course["code"]] = course;
      }
      fs.writeFileSync(
        `./data/${semester}/src/${time}/${subject.subject}.json`,
        JSON.stringify(courses),
        { mode: 0755 }
      );
      logger.info(`${subject.subject}.json written.`);
    })
    .catch(logger.error);
}

module.exports = fetchCourses;

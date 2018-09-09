const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const moment = require("moment");
const logger = require("./logger")("fetcher");

const { Course } = require("./course");

var domain = "https://w5.ab.ust.hk/";
var uri = "https://w5.ab.ust.hk/wcq/cgi-bin/1810/";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms)); // Sleep function in ms

/**
 * Fetch information from ARRO website
 * @param {Integer} timeout - Timeout per request in ms
 */
const fetchCourses = timeout =>
  request({
    uri: uri,
    transform: function(body) {
      return cheerio.load(body);
    }
  })
    .then($ => {
      var depts = $(".depts")
        .find("a")
        .map((index, el) => {
          var obj = {};
          obj["subject"] = $(el).text();
          obj["href"] = domain + $(el).attr("href");
          return obj;
        })
        .get();
      const currentTime = moment().format("YYMMDDhhmmss");
      fs.mkdir(`./subjects/${currentTime}/`, err => {
        if (err) logger.error(err);
      });
      (async () => {
        for (var i = 0; i < depts.length; i++) {
          parseSubject(currentTime, depts[i]);
          await sleep(timeout);
        }
      })();
    })
    .catch(logger.error);

/**
 * The entry point of parsing one subject
 * @param {String} time - Current time
 * @param {Object} subject - Subject code and link
 */
function parseSubject(time, subject) {
  request({
    uri: subject["href"],
    transform: function(body) {
      return cheerio.load(body);
    }
  })
    .then($ => {
      const raw_courses = $("div.course");
      var courses = [];
      for (var i = 0; i < raw_courses.length; i++) {
        const raw_course = $(raw_courses[i]);
        var course = new Course($);
        course
          .parseTitle(raw_course.find("h2").text())
          .parseCourseInfo(raw_course.find(".courseattr .popupdetail")[0])
          .parseSections(raw_course.find(".sections")[0]);

        courses.push(course);
      }
      fs.writeFile(
        `./subjects/${time}/${subject.subject}.json`,
        JSON.stringify(courses),
        { mode: 0755 },
        err => {
          if (err) logger.error(err);
          else logger.info(`${subject.subject}.json written.`);
        }
      );
    })
    .catch(logger.error);
}

module.exports = fetchCourses;

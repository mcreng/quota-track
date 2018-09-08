const request = require("request-promise");
const cheerio = require("cheerio");

const { Course } = require("./course");

var domain = "https://w5.ab.ust.hk/";
var uri = "https://w5.ab.ust.hk/wcq/cgi-bin/1810/";

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
    parseSubject(depts[0]);
  })
  .catch(console.error);

/**
 * The entry point of parsing one subject
 * @param {Object} subject - Subject code and link
 */
function parseSubject(subject) {
  console.log(subject);
  request({
    uri: subject["href"],
    transform: function(body) {
      return cheerio.load(body);
    }
  })
    .then($ => {
      const courses = $("div.course");
      for (var i = 0; i < courses.length; i++) {
        const raw_course = $(courses[i]);
        var course = new Course($);
        course
          .parseTitle(raw_course.find("h2").text())
          .parseCourseInfo(raw_course.find(".courseattr .popupdetail")[0])
          .parseSections(raw_course.find(".sections")[0]);
        // console.log(course);
      }
    })
    .catch(console.error);
}

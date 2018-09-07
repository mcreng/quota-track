var request = require('request-promise');
var cheerio = require('cheerio');

var domain = 'https://w5.ab.ust.hk/';
var uri = 'https://w5.ab.ust.hk/wcq/cgi-bin/1810/';

request({
  uri: uri,
  transform: function(body) {
    return cheerio.load(body);
  }
})
    .then($ => {
      var depts = $('.depts')
                      .find('a')
                      .map((index, el) => {
                        var obj = {};
                        obj['subject'] = $(el).text();
                        obj['href'] = domain + $(el).attr('href');
                        return obj;
                      })
                      .get();
      parseSubject(depts[0]);
    })
    .catch(console.error);

/**
 * Constructor on a course
 */
function Course() {
  this.subject = null;
  this.code = null;
  this.title = null;
  this.credits = null;
  this.cc = null;
  this.description = null;

  this.sections = null;

  this.parseTitle = title => {

    return this;
  }
}


/**
 * The entry point of parsing one subject
 * @param {Object} subject - Subject code and link
 */
function parseSubject(subject) {
  console.log(subject);
  request({
    uri: subject['href'],
    transform: function(body) {
      return cheerio.load(body);
    }
  })
      .then($ => {
        const courses = $('div.course');
        for (var i = 0; i < courses.length; i++) {
          const raw_course = $(courses[i]);
          var course = new Course;
          course.parseTitle(raw_course.find('h2').text())
          console.log(course);
        }

      })
      .catch(console.error);
}

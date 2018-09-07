var request = require('request-promise');
var cheerio = require('cheerio');

var domain = 'https://w5.ab.ust.hk/';
var uri = 'https://w5.ab.ust.hk/wcq/cgi-bin/1810/';

request({
    uri: uri,
    transform: function (body) {
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
function Course($) {
  this.$ = $;
  this.subject = null;
  this.code = null;
  this.title = null;
  this.credits = null;
  this.cc = null;
  this.details = null;

  this.sections = null;

  this.parseTitle = title => {
    title = title.split(' - ');
    var [subject, code] = title[0].split(' ');
    title = title[1].split(' (');
    var credits = title[1].split(' unit')[0];
    title = title[0];

    this.title = title;
    this.subject = subject;
    this.code = code;
    this.credits = credits;
    return this;
  };

  this.parseCourseInfo = courseInfo => {
    const $ = this.$;
    const table = $(courseInfo);
    const headers = table.find('th').map((i, el) => $(el).text()).get();
    const contents = table.find('td').map((i, el) => $(el).text()).get();

    var details = {};

    for (var i = 0; i < headers.length; i++) {
      details[headers[i]] = contents[i];
    }
    this.details = details;
    console.log(this);
    return this;
  };
}

/**
 * The entry point of parsing one subject
 * @param {Object} subject - Subject code and link
 */
function parseSubject(subject) {
  console.log(subject);
  request({
      uri: subject['href'],
      transform: function (body) {
        return cheerio.load(body);
      }
    })
    .then($ => {
      const courses = $('div.course');
      for (var i = 0; i < courses.length; i++) {
        const raw_course = $(courses[i]);
        var course = new Course($);
        course.parseTitle(raw_course.find('h2').text());
        course.parseCourseInfo(raw_course.find('.courseattr .popupdetail')[0]);
        // console.log(course);
      }
    })
    .catch(console.error);
}
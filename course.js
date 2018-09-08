/**
 * Constructor on a course
 */
function Course($) {
  this.$ = $;
  this.subject = null;
  this.code = null;
  this.title = null;
  this.credits = null;
  this.details = null;

  this.sections = null;

  /**
   * Parses course title, subject, code and credit amount.
   * @param {string} title
   * @returns {Course}
   */
  this.parseTitle = title => {
    title = title.split(" - ");
    var [subject, code] = title[0].split(" ");
    title = title[1].split(" (");
    var credits = title[1].split(" unit")[0];
    title = title[0];

    this.title = title;
    this.subject = subject;
    this.code = code;
    this.credits = credits;
    return this;
  };

  /**
   * Parses course infos such as requisites, descriptions and ILOs.
   * @param {*} courseInfo
   * @returns {Course}
   */
  this.parseCourseInfo = courseInfo => {
    const $ = this.$;
    const table = $(courseInfo);
    const headers = table
      .find("th")
      .map((i, el) => $(el).text())
      .get();
    const contents = table
      .find("td")
      .map((i, el) => $(el).text())
      .get();

    var details = {};

    for (var i = 0; i < headers.length; i++) {
      details[headers[i]] = contents[i];
    }
    this.details = details;
    return this;
  };

  this.parseSections = sections => {
    const $ = this.$;
    const raw_sections = $(sections);

    var contents = raw_sections
      .find("tr")
      .map((i, el) => [
        $(el)
          .find("td")
          .map((i, el) => $(el).text())
          .get()
      ])
      .get();

    console.log(contents);
  };
}

function Section($) {
  this.code = null;
  this.dateTime = null;
  this.room = null;
  this.instructor = null;
  this.quota = null;
  this.enrol = null;
  this.avail = null;
  this.wait = null;
  this.remarks = null;
}

module.exports = { Course };

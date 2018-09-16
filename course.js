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
    var subject = title.match(/\w{4} \d{4}\w?/g)[0];
    title = title.replace(subject + " - ", "");
    var [subject, code] = subject.split(" ");

    title = title.split(" (");
    const credits = title[1].split(" unit")[0];
    title = title[0];

    this.title = title;
    this.subject = subject;
    this.code = code;
    this.credits = parseInt(credits);
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
      .map((i, el) =>
        $(el)
          .text()
          .toLowerCase()
      )
      .get();
    const contents = table
      .find("td")
      .map((i, el) => $(el).text())
      .get();

    var details = {};

    for (var i = 0; i < headers.length; i++) {
      switch (headers[i]) {
        case "attributes":
          contents[i] = contents[i]; //TODO: find way to break lines
          break;
        case "pre-requisite": //TODO: parse logical relation
          break;
        case "co-requisite": //TODO: parse logical relation
          break;
        default:
          break;
      }
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
          .map((i, el) => {
            const children = $($(el).children());
            if (
              children.length > 0 && // if contain children
              !$(children[0]).is("br") && // if children is not <br> (for date time)
              !$(children[0]).is("a") && // if children is not <a> (for instructors)
              !$(children[0]).is("strong") // if children is strong (for quotas)
            ) {
              return [children.map((i, el) => $(el).text()).get()]; // get text from each children
            } else {
              return $(el).text(); // get text as a whole
            }
          })
          .get()
      ])
      .get();

    contents = contents.slice(1).map(x => [x]); // Remove table headers

    for (var i = 0, j = -1; i < contents.length; i++) {
      if (contents[i][0].length !== 9) {
        contents[j].push(contents[i][0]);
      } else {
        j++;
        contents[j] = contents[i];
      }
    }
    contents = contents.slice(0, j + 1);

    this.sections = {};
    for (var i = 0; i < contents.length; i++) {
      const section = this.parseSection(contents[i]);
      this.sections[section["id"]] = section;
    }

    return this;
  };

  this.parseSection = content => {
    var section = new Section();
    // Parse main row
    const row = content[0];
    const id_code = row[0].split(" (");
    section.code = id_code[0];
    section.id = parseInt(id_code[1].split(")")[0]);
    section.dateTime = [row[1].split("\n")]; // Split mutliline dateTime
    var room = row[2].split(" (");
    if (room.length === 2) {
      room[1] = parseInt(room[1].split(")")[0]);
    } else {
      room.push(null); // signifies capacity is not listed
    }
    section.room = [room]; // Stores (room number, capacity)
    section.instructors = [row[3].split("\n")]; // Split multiline instructors
    section.quota = [parseInt(row[4])];
    section.enrol = [parseInt(row[5])];
    section.avail = [parseInt(row[6])];
    section.wait = [parseInt(row[7])];
    section.remarks =
      row[8] === String.fromCharCode(160)
        ? null
        : row[8][0].split("\n").map(el => el.replace("> ", "")); // Make " " to null, split multiline remarks anad remove leading "> "

    // Parse remaining rows
    for (var i = 1; i < content.length; i++) {
      section.dateTime.push(content[i][0].split("\n"));
      var room = content[i][1].split(" (");
      if (room.length === 2) {
        room[1] = parseInt(room[1].split(")")[0]);
      } else {
        room.push(null); // signifies capacity is not listed
      }
      section.room.push(room); // Store (Room number, capacity)
      section.instructors.push(content[i][2].split("\n"));
    }

    return section;
  };
}

function Section() {
  this.id = null; // 4-digit section id
  this.code = null; // L*, T* or LA* for example
  this.dateTime = null;
  this.room = null;
  this.instructors = null;
  this.quota = null;
  this.enrol = null;
  this.avail = null;
  this.wait = null;
  this.remarks = null;
}

module.exports = { Course };

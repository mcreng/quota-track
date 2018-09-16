/**
 * This script parses course information from data/src/YYMMDDHHmmss/*.json
 * This script should trigger once after every fetch since information may change
 */

const fs = require("fs");
const jsonfile = require("jsonfile");
const logger = require("./logger")("parser");
/**
 * Extract basic course information
 * @param {String} semester - string for semester, e.g. '1810'
 * @param {String} folderName - the string of YYMMDDHHmmss, e.g. '1809011315'
 * @param {String} subjectName - should not include '.json', e.g. 'ACCT'
 */
const extractBasicInfo = (semester, folderName, subjectName) => {
  jsonfile.readFile(
    `./data/${semester}/src/${folderName}/${subjectName}.json`,
    (err, data) => {
      if (err) console.error(err);
      Object.entries(data).map(([_, course]) => {
        return Object.entries(course["sections"]).map(([_, section]) => {
          delete section["quota"];
          delete section["avail"];
          delete section["enrol"];
          delete section["wait"];
          return section;
        });
      });
      fs.existsSync(`./data/${semester}/info/`) ||
        fs.mkdirSync(`./data/${semester}/info/`);
      fs.writeFileSync(
        `./data/${semester}/info/${subjectName}.json`,
        JSON.stringify(data),
        {
          mode: 0755
        }
      );
      logger.info(`${subjectName}.json course info parsed`);
    }
  );
};

/**
 * Extract course quota information
 * @param {String} semester - string for semester, e.g. '1810'
 * @param {String} folderName - the string of YYMMDDHHmmss, e.g. '1809011315'
 * @param {String} subjectName - should not include '.json', e.g. 'ACCT'
 */
const extractQuotaInfo = (semester, folderName, subjectName) => {
  jsonfile.readFile(
    `./data/${semester}/src/${folderName}/${subjectName}.json`,
    (err, data) => {
      if (err) console.error(err);
      Object.entries(data).map(([_, course]) => {
        delete course["title"];
        delete course["credits"];
        delete course["details"];
        return Object.entries(course["sections"]).map(([_, section]) => {
          delete section["code"];
          delete section["dateTime"];
          delete section["room"];
          delete section["instructors"];
          delete section["remarks"];
          return section;
        });
      });
      fs.existsSync(`./data/${semester}/quota/`) ||
        fs.mkdirSync(`./data/${semester}/quota/`);
      if (!fs.existsSync(`./data/${semester}/quota/${subjectName}.json`)) {
        fs.writeFileSync(
          `./data/${semester}/quota/${subjectName}.json`,
          JSON.stringify(data),
          {
            mode: 0755
          }
        );
        logger.info(`${subjectName}.json course quota parsed`);
      } else {
        const originalData = jsonfile.readFileSync(
          `./data/${semester}/quota/${subjectName}.json`
        );

        const newData = [originalData]
          .concat(data) // Put originalData and data into an array and trigger reduce
          .reduce((result, currentData) => {
            return (
              Object.keys(currentData).forEach(currentCourseIndex => {
                // currentData can be {originalData, data}, loops through courses in data
                if (!result[currentCourseIndex])
                  // if course does not exists, just concat
                  result[currentCourseIndex] = currentData[currentCourseIndex];
                // otherwise
                else {
                  Object.keys(
                    currentData[currentCourseIndex]["sections"]
                  ).forEach(
                    // loop through sections of a course
                    currentSectionIndex => {
                      const resultSection = // pointer to current resultSection
                        result[currentCourseIndex]["sections"][
                          currentSectionIndex
                        ];
                      const currentSection = // pointer to current currentSection
                        currentData[currentCourseIndex]["sections"][
                          currentSectionIndex
                        ];
                      if (!resultSection)
                        // if section does not exist, just concat
                        result[currentCourseIndex]["sections"][
                          currentSectionIndex
                        ] =
                          currentData[currentCourseIndex]["sections"][
                            currentSectionIndex
                          ];
                      else {
                        // otherwise
                        const entries = ["quota", "enrol", "avail", "wait"];
                        entries.forEach(entry => {
                          // consider the 4 entires, loop through them and concat them
                          resultSection[entry] = resultSection[entry].concat(
                            currentSection[entry]
                          );
                        });
                      }
                    }
                  );
                  // Now find the entries is originalData that no longer exist
                  Object.keys(result[currentCourseIndex]["sections"])
                    .diff(
                      Object.keys(currentData[currentCourseIndex]["sections"])
                    )
                    // loop through them
                    .forEach(item => {
                      const entries = ["quota", "enrol", "avail", "wait"];
                      entries.forEach(entry => {
                        // consider the 4 entires, loop through them and append null
                        result[currentCourseIndex]["sections"][item][
                          entry
                        ].push(null);
                      });
                    });
                }
              }),
              result
            ); // default return value
          }, {});

        fs.writeFile(
          `./data/${semester}/quota/${subjectName}.json`,
          JSON.stringify(newData),
          {
            mode: 0755
          },
          err => {
            if (err) logger.error(err);
          }
        );
        logger.info(`${subjectName}.json course quota parsed and appended`);
      }
    }
  );
};

module.exports = { extractBasicInfo, extractQuotaInfo };

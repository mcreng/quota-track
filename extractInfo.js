/**
 * This script parses course information from data/src/YYMMDDHHmmss/*.json
 * This script should trigger once after every fetch since information may change
 */

const fs = require("fs");
const jsonfile = require("jsonfile");
const logger = require("./logger")("parser");
/**
 * Extract basic course information
 * @param {String} folderName - the string of YYMMDDHHmmss, e.g. '1809011315'
 * @param {String} subjectName - should not include '.json', e.g. 'ACCT'
 */
const extractBasicInfo = (folderName, subjectName) => {
  jsonfile.readFile(
    `./data/src/${folderName}/${subjectName}.json`,
    (err, data) => {
      if (err) console.error(err);
      data.map(course => {
        return course["sections"].map(section => {
          delete section["quota"];
          delete section["avail"];
          delete section["enrol"];
          delete section["wait"];
          return section;
        });
      });
      fs.existsSync(`./data/info/`) || fs.mkdirSync(`./data/info/`);
      fs.existsSync(`./data/info/${folderName}`) ||
        fs.mkdirSync(`./data/info/${folderName}`);
      fs.writeFileSync(
        `./data/info/${folderName}/${subjectName}.json`,
        JSON.stringify(data),
        {
          mode: 0755
        }
      );
      logger.info(`${subjectName}.json course info parsed`);
    }
  );
};

module.exports = extractBasicInfo;

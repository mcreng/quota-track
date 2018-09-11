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

/**
 * Extract course quota information
 * @param {String} folderName - the string of YYMMDDHHmmss, e.g. '1809011315'
 * @param {String} subjectName - should not include '.json', e.g. 'ACCT'
 */
const extractQuotaInfo = (folderName, subjectName) => {
  jsonfile.readFile(
    `./data/src/${folderName}/${subjectName}.json`,
    (err, data) => {
      if (err) console.error(err);
      data.map(course => {
        delete course["title"];
        delete course["credits"];
        delete course["details"];
        return course["sections"].map(section => {
          delete section["code"];
          delete section["dateTime"];
          delete section["room"];
          delete section["instructors"];
          delete section["remarks"];
          return section;
        });
      });
      fs.existsSync(`./data/quota/`) || fs.mkdirSync(`./data/quota/`);
      if (!fs.existsSync(`./data/quota/${subjectName}.json`)) {
        fs.writeFileSync(
          `./data/quota/${subjectName}.json`,
          JSON.stringify(data),
          {
            mode: 0755
          }
        );
        logger.info(`${subjectName}.json course quota parsed`);
      } else {
        const originalData = jsonfile.readFileSync(
          `./data/quota/${subjectName}.json`
        );

        // TODO: Need to merge originalData with data to newData

        fs.writeFile(
          `./data/quota/${subjectName}.json`,
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

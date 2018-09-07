var request = require("request-promise");
var cheerio = require("cheerio");

var domain = "https://w5.ab.ust.hk/";
var uri = "https://w5.ab.ust.hk/wcq/cgi-bin/1810/";

var options = {
  uri: uri,
  transform: function(body) {
    return cheerio.load(body);
  }
};

request(options)
  .then($ => {
    var depts = $(".depts")
      .find("a")
      .map((index, el) => {
        var obj = {};
        obj["subject"] = $(el).text();
        obj["href"] = $(el).attr("href");
        return obj;
      })
      .get();
    console.log(depts);
  })
  .catch(console.error);

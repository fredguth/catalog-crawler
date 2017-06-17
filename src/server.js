var http = require('http');
var fs = require('fs');
const utils = require ('../utils.js');
//var path = require ('path');

var jobs = JSON.parse(fs.readFileSync('jobs.json', 'utf8'));

var accept = function (job, item) {
  if (!job.static) {
    if (job.next) {
      var index = job.next.indexOf(item);
      job.next.splice(index, 1);
    }
    job.last.push(item);
    const content = JSON.stringify(jobs, null, 2);
    fs.writeFile("jobs.json", content, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
  }

}

var reject = function (job, item) {
  //do nothing
}

var getNatura = require ("./natura.js");

var filename, filepath, url;

for (var brand in jobs) {
    // skip loop if the property is from prototype
    if (!jobs.hasOwnProperty(brand)) continue;

    var job = jobs[brand];
    if (brand=="natura") {
      getNatura(job);
      continue;
    }

    job.next.forEach(function(item) {

      filename = job.file_template.replace('::::><::::', item);
      if (job.path_template) {
        filepath = job.path_template.replace('::::><::::', item)+filename;
      } else {
        filepath = './'+brand+'/'+filename;
      }
      url = job.url_template.replace('::::><::::', item) + filename;
      utils.download(url , filepath, accept, reject, job, item);
    });

}


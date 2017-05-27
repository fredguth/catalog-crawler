var http = require('http');
var fs = require('fs');
//var path = require ('path');

var jobs = JSON.parse(fs.readFileSync('jobs.json', 'utf8'));

var download = function(url, filename, accept, reject, job, item) {

  var file = fs.createWriteStream(filename);
  var request = http.get(url, function(response) {
    var downloaded = 0;
    var len = parseInt(response.headers['content-length'], 10);
    response.pipe(file);
    response.on('data', function (chunk) {
      downloaded += chunk.length;
      process.stdout.write("Downloading " + filename + " "+(100.0 * downloaded / len).toFixed(2) + "%                          \r");
    });
    file.on('finish', function() {
      file.close(function() {
        if (response.statusCode=="200") {
          accept(job, item);
        } else {
          fs.unlink(filename);
          reject(job, item)
        }

      });  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(filename); // Delete the file async. (But we don't check the result)
    reject(job, item);
  });

}

var accept = function (job, item) {
  if (!job.static) {
    var index = job.next.indexOf(item);
    job.next.splice(index, 1);
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

var filename, filepath, url;

for (var brand in jobs) {
    // skip loop if the property is from prototype
    if (!jobs.hasOwnProperty(brand)) continue;

    var job = jobs[brand];
    job.next.forEach(function(item) {
      filename = job.file_template.replace('::::><::::', item);
      if (job.path_template) {
        filepath = job.path_template.replace('::::><::::', item)+filename;
      } else {
        filepath = './'+brand+'/'+filename;
      }
      url = job.url_template.replace('::::><::::', item) + filename;
      download(url , filepath, accept, reject, job, item);
    });

}


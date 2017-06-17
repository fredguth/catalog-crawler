const http = require('http');
const fs = require('fs');
module.exports = {
  download(url, filename, accept, reject, job, item) {

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

        });
      });
    }).on('error', function(err) { // Handle errors
      fs.unlink(filename); // Delete the file async. (But we don't check the result)
      reject(job, item);
    });

  }


}




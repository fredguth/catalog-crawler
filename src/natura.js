const fs = require('fs');
const request = require('request-promise');
const utils = require('../utils.js');


module.exports = function(job) {
  var states = JSON.parse(fs.readFileSync('natura_sources.json', 'utf8'));
  Promise.resolve(states)
    .then(updateNids)
    .then(updateCicles)
    .then(downloadRevistas)
}
var f = function (a) {
  console.log(JSON.stringify(a, null, 2));
}
var updateNids = function (states) {
  return new Promise((resolve, reject)=>{
    var promises = [];
    for (var uf in states) {
      var state = states[uf];
      var url = `http://www.natura.com.br/map/cicle-infos/${state.nid}/${state.tid}`;

      (function(uf) {
        promises.push(request({url}, (err, response, body) => {
          if(err) { console.log(err); return; }
          var data = JSON.parse(body).data;
          var nid = data.items[data.items.length-1].nid;
          states[uf]["nid"]=nid;
        }));
      })(uf);
    }
    Promise.all(promises).then(()=>{
      var content = JSON.stringify(states, null, 2);
      fs.writeFile("natura_sources.json", content, 'utf8', function (err) {
          if (err) {
              reject(err);
          }
      });
      resolve(states);
    });
  });
}
var updateCicles = function (states) {
  var cicles = {};
  return new Promise((resolve, reject)=>{
    var promises = [];
    for (var uf in states) {
      var state = states[uf];
      var url = `http://www.natura.com.br/map/cicle-infos/${state.nid}/${state.tid}`;
     (function(uf) {
        promises.push(request({url}, (err, response, body) => {
          if(err) { console.log(err); return; }
          var data = JSON.parse(body).data;
          for (var i=0; i < data.items.length; i++) {
            var item = data.items[i];
            cicles[item.cicle]= cicles[item.cicle]||{};
            cicles[item.cicle][item.url]=cicles[item.cicle][item.url]||{};
            cicles[item.cicle][item.url].pdf = item.pdf;
            cicles[item.cicle][item.url].url = item.url;
            // cicles[item.cicle][item.url].states = cicles[item.cicle][item.url].states||[];
            // if (cicles[item.cicle][item.url].states.indexOf(uf) < 0) {
            //   cicles[item.cicle][item.url].states.push(uf);
            // }
          }
        }));
      })(uf);
    }
    Promise.all(promises).then(()=>{
      resolve(cicles);
    });
  });
}

var downloadRevistas = function (cicles) {
  var accept = function (cicle, path) {
    var jobs = JSON.parse(fs.readFileSync('jobs.json', 'utf8'));
    var index = jobs["natura"].last.indexOf(`${path}`);
    if (index < 0) {
      jobs["natura"].last.push(`${path}`);
      const content = JSON.stringify(jobs, null, 2);
      fs.writeFile("jobs.json", content, 'utf8', function (err) {
          if (err) {
              return console.log(err);
          }
      });
    }
  }

  for (var cicle in cicles) {
    for (var item in cicles[cicle]) {

      //console.log(JSON.stringify(cicles[cicle][item], null, 2));
      //var ufs = cicles[cicle][item].states.sort().join('-').toUpperCase();
      var name = cicles[cicle][item].pdf.substring(cicles[cicle][item].pdf.lastIndexOf('/')+1);
      filepath = `./natura/${cicle}___${name}`;
      if (!fs.existsSync(filepath)) {
        utils.download(cicles[cicle][item].pdf , filepath, accept, console.error, cicle, filepath);
      }

    }
  }
}


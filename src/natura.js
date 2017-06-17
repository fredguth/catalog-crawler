const fs = require('fs');
const request = require('request-promise');
const utils = require('../utils.js');


module.exports = function(job) {
  var states = JSON.parse(fs.readFileSync('natura_sources.json', 'utf8'));
  Promise.resolve(states)
    .then(updateNids)
    .then(updateCicles)
    .then(downloadNids)
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
            cicles[item.cicle][item.nid]=cicles[item.cicle][item.nid]||{};
            cicles[item.cicle][item.nid].pdf = item.pdf;
            cicles[item.cicle][item.nid].states = cicles[item.cicle][item.nid].states||[];
            if (cicles[item.cicle][item.nid].states.indexOf(uf) < 0) {
              cicles[item.cicle][item.nid].states.push(uf);
            }
          }
        }));
      })(uf);
    }
    Promise.all(promises).then(()=>{
      resolve(cicles);
    });
  });
}

var downloadNids = function (cicles) {
  var accept = function (cicle, ufs) {
    var jobs = JSON.parse(fs.readFileSync('jobs.json', 'utf8'));
    var index = jobs["natura"].last.indexOf(`${cicle}___${ufs}`);
    if (index < 0) {
      jobs["natura"].last.push(`${cicle}___${ufs}`);
    const content = JSON.stringify(jobs, null, 2);
    fs.writeFile("jobs.json", content, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
    }
  }

  for (var cicle in cicles) {
    for (var nid in cicles[cicle]) {

      //console.log(JSON.stringify(cicles[cicle][nid], null, 2));
      var ufs = cicles[cicle][nid].states.sort().join('-').toUpperCase();
      var name = cicles[cicle][nid].pdf.substring(cicles[cicle][nid].pdf.lastIndexOf('/')+1);
      filepath = `./natura/${cicle}___${ufs}___${name}`;
      if (!fs.existsSync(filepath)) {
        utils.download(cicles[cicle][nid].pdf , filepath, accept, console.error, cicle, ufs);
      }

    }
  }
}


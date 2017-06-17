const http = require('http');
const fs = require('fs');
const request = require('request-promise');



module.exports = function(job) {
  var states = JSON.parse(fs.readFileSync('natura_sources.json', 'utf8'));
  Promise.resolve(states)
    .then(updateNids)
    .then(updateCicles)
    .then(f)
}
var f = function (a) {
  console.log(a);
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
      resolve(JSON.stringify(cicles, null, 2));
    });
  });
}

// "2017-05":{
//   "14496": {
//     pdf: "",
//     //tids:["5360", "4321"],
//     states: ["sp", "rj"]
//   }
// }
//
//
//
//
// {
//    "data":{
//       "items":[
//          {
//             "title":"Espa\u00e7o Natura C05 - NENO\/RJES",
//             "nid":"14496",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/revista-espaco-c05-17.png?itok=IUMo42zu",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/revistaespaconatura_c05_neno_rjes.pdf",
//             "cicle":"2017-05",
//             "season":"",
//             "headline":"",
//             "description":"\u003Cp\u003EA fragr\u00e2ncia de sucesso de Essencial em vers\u00e3o de 50 ml, a alta tecnologia das novas m\u00e1scaras Una Extremific e mais lan\u00e7amentos de Faces d\u00e3o o tom deste ciclo cheio de novidades.\u003C\/p\u003E",
//             "url":"revista\/espaco-natura-c05-nenorjes"
//          },
//          {
//             "title":"Espa\u00e7o Natura C06 - RJES",
//             "nid":"14746",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/revista-espaco-c06-17.png?itok=ifNoHUTQ",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/revistaespaconatura_c06_17_rjes.pdf",
//             "cicle":"2017-06",
//             "season":"",
//             "headline":"",
//             "description":"\u003Cp\u003EEspecial Dia das M\u00e3es: Tem sempre a beleza de uma hist\u00f3ria entre um De e um Para. Para cada hist\u00f3ria existe um presente Natura.\u003C\/p\u003E",
//             "url":"revista\/espaco-natura-c06-rjes"
//          },
//          {
//             "title":"Espa\u00e7o Natura C07 - NENO\/RJES",
//             "nid":"15026",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/revista-espaco-c07-17.png?itok=LpUf5bTT",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/revistaespaconatura_c07_17_neno_rjes.pdf",
//             "cicle":"2017-07",
//             "season":"",
//             "headline":"",
//             "description":"\u003Cp\u003ENa alquimia da perfumaria, a alquimia do Brasil. Natura, a Casa da Perfumaria do Brasil.\u003C\/p\u003E",
//             "url":"revista\/espaco-natura-c07-nenorjes"
//          },
//          {
//             "title":"Espa\u00e7o Natura C08 - RJES",
//             "nid":"15476",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/revista-espaco-c08-17.jpg?itok=K6rzkRSr",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/pages_ciclo08-17_v4_bx.pdf",
//             "cicle":"2017-08",
//             "season":"",
//             "headline":"",
//             "description":"",
//             "url":"revista\/espaco-natura-c08-rjes"
//          },
//          {
//             "title":"Espa\u00e7o Natura C09 - CO-SPC-RJ-ES",
//             "nid":"15911",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/ciclo09-17_v1_capa_3.jpg?itok=89JqLJuh",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/pages_ciclo09-17_v3_centro-oeste_sao_paulo_capital_rio_de_janeiro_e_espirito_santo.pdf",
//             "cicle":"2017-09",
//             "season":"",
//             "headline":"",
//             "description":"\u003Cp\u003EUm ciclo cheio de novidades para aquecer seu cora\u00e7\u00e3o: pele ultra-hidratada com Tododia Cereja e Avel\u00e3, tr\u00eas novos tons do batom l\u00edquido Matific de UNA e a bolsa mais fashion do mercado da linha Mam\u00e3e e Beb\u00ea!\u003C\/p\u003E",
//             "url":"revista\/espaco-natura-c09-co-spc-rj-es"
//          },
//          {
//             "title":"Espa\u00e7o Natura C10 - SPC-SPIL-MG-CO-SUL-RJ-ES",
//             "nid":"16471",
//             "cover":"http:\/\/www.natura.com.br\/sites\/default\/files\/styles\/is_map_slider\/public\/catalogs\/espaco-natura-site-cn.jpg?itok=h-zBgwbv",
//             "pdf":"http:\/\/www.natura.com.br\/sites\/default\/files\/catalogs\/pages_ciclo10-17_v2_spc_spi_mg_co_sul_rj_es_bx.pdf",
//             "cicle":"2017-10",
//             "season":"",
//             "headline":"",
//             "description":"",
//             "url":"revista\/espaco-natura-c10-spc-spil-mg-co-sul-rj-es"
//          }
//       ],
//       "current":"16471"
//    }
// }
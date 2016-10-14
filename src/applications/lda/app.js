'use strict'; // @flow

var fs = require('fs');
var path = require('path');

// This file is not transpiled by babel-node, since it is required at runtime
// from settings.js via a non-literal `require`.

// var settings = {
//   "modelName": "lda100",
//   "numTopics": 5,
//   "optimize": {
//     "steps": 1, // 10000
//     "optMethod": {
//       "adam": {
//         "stepSize": 0.01,
//         "decayRate1": 0.9,
//         "decayRate2": 0.999
//       }
//     },
//     "estimator": {
//       "ELBO": {
//         "samples": 1,
//         "avgBaselines": true
//       }
//     }
//   }
// };

module.exports = {
  learn: {
    data: JSON.parse(fs.readFileSync(path.join(__dirname, 'cocolabAbstractCorpus.json'), 'utf-8')),
    webppl: {
      "modelName": "lda100",
      "numTopics": 5,
      "optimize": {
        "steps": 1, // 10000
        "optMethod": {
          "sgd": {
            "stepSize": 0.001
          }
        },
        "estimator": {
          "ELBO": {
            "samples": 1,
            "avgBaselines": false
          }
        }
      }
    }
  }
};

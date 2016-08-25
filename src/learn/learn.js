'use strict';

const colors = require('colors/safe');
const fs = require('fs');
const http = require('http');
const path = require('path');
const sendPostRequest = require('request').post;
const webppl = require('webppl');
const _ = require('lodash');

const port = 3004;


function makeMessage(text) {
  return colors.green('[learn]') + ` ${text}`;;
}

function log(text) {
  console.log(makeMessage(text));
}

function error(text) {
  console.log(makeMessage(text));
}

function initLearner() {
  log('compiling webppl code');
  const learnerCodePath = path.join(__dirname, 'learner.wppl');
  const learnerCode = fs.readFileSync(learnerCodePath, 'utf8');  
  const compiledModel = webppl.compile(learnerCode, {
    verbose: true,
    debug: true
  });
  const headerPath = path.join(__dirname, 'registerParams.js');
  webppl.requireHeader(headerPath);
  return compiledModel;
}

function loadUserData(callbacks) {
  log('reading user data from db');
  sendPostRequest(
    'http://127.0.0.1:4000/db/find',
    { json: { collection: 'percepts' } },
    (error, res, body) => {
      if (!error && res && res.statusCode === 200) {
        log('successfully read user data from db');
        const groupedData = _.groupBy(body, 'email');
        const sortedData = _.mapValues(groupedData, (value, key) => {
          return _.sortBy(value, 'datetime');
        });
        callbacks.success(sortedData);
      } else {
        log(`failed to read user data from db: ${res ? res.statusCode : ''} ${error}`);
        callbacks.failure();
      }
    });
}

function loadParameters(callbacks) {
  log('reading current model parameters from db');
  const queryData = {
    collection: 'parameters',
    query: {
      '$orderby': { '$natural': -1 },
      '$query': {} }
  };
  sendPostRequest(
    'http://127.0.0.1:4000/db/findOne',
    { json: queryData },
    (error, res, body) => {
      if (!error && res && res.statusCode === 200) {
        log('successfully read parameters from db');
        let newParameters = undefined;
        if (!body) {
          log('no parameters found, starting with empty parameter set');
        } else {
          if (!body.params) {
            error('expected params document to have single params key');
            callbacks.failure();
          }
          newParameters = body.params;
        }
        callbacks.success(newParameters);
      } else {
        log(`failed to read user data from db: ${res ? res.statusCode : ''} ${error}`);
        callbacks.failure();
      }
    });
}

function updateParameters(options, callbacks) {
  log('running webppl model to update parameters');
  const prepared = webppl.prepare(
    options.model,
    (s, value) => {
      const newParameters = value.newParameters;
      const output = value.output;
      log(`webppl: ${output}`);
      callbacks.success(newParameters)
    },
    { initialStore: { userData: options.userData, params: options.params } }
  );
  prepared.run();
}

function storeParameters(params, callbacks) {
  log('storing new model parameters in db');
  const data = {
    collection: 'parameters',
    datetime: new Date(),
    params
  };
  sendPostRequest(
    'http://localhost:4000/db/insert',
    { json: data },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        log(`stored new params: ${JSON.stringify(data)}`);
        callbacks.success();
      } else {
        log(`error storing new params: ${error} ${body}`);
        callbacks.failure();
      }
    }
  );
}

function runLearner(model) {
  function failure() {
    log('learner failed to complete iteration, starting over');
    setTimeout(() => runLearner(model), 2000);
  }
  loadUserData({
    success: (userData) => {
      loadParameters({
        success: (params) => {
          updateParameters({ params, userData, model }, {
            success: (newParams) => {
              storeParameters(newParams, {
                success: () => {
                  log('successfully completed learner iteration');
                  setTimeout(() => runLearner(model), 1000);
                },
                failure
              });
            },
            failure
          });
        },
        failure
      });
    },
    failure
  });
}


function serve() {

  const server = http.createServer((request, response) => {
    // optionally do something (maybe report on inference progress?)
  });

  const compiledModel = initLearner();

  runLearner(compiledModel);

  server.listen(port, (err) => {
    if (err) {
      return log('something bad happened', err);
    }
    log(`running at http://localhost:${port}`);
  });

}


if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

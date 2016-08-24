'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const webppl = require('webppl');
const sendPostRequest = require('request').post;

const port = 3004;


function clog(x) {
  console.log('[learn] ' + x);
}

const interval = 3 * 1000; // seconds


function updateBeliefs(responses) {
  const prepared = webppl.prepare(
    compiled,
    (s, x) => {
      clog(JSON.stringify(s.output))
    },
    {initialStore: {input: responses}}
  );
  prepared.run();
}

const responses = [];

setInterval(function() {
  clog('reading from db');


  // responses.push(Math.random());

  // clog('learning');
  // updateBeliefs(responses);

  // clog('writing to db (TODO)');
}, interval);


function initLearner() {
  clog('compiling webppl code');
  const learnerCodePath = path.join(__dirname, 'learner.wppl');
  const learnerCode = fs.readFileSync(learnerCodePath, 'utf8');
  const compiledModel = webppl.compile(learnerCode, {
    verbose: true,
    debug: true
  });
  return compiledModel;
}

function loadUserData(callbacks) {
  clog('reading user data from db');
  sendPostRequest(
    'http://127.0.0.1:4000/db/find',
    { json: { collection: 'percepts' } },
    (error, res, body) => {
      if (!error && res && res.statusCode === 200) {
        clog('successfully read user data from db');
        callbacks.success(body);
      } else {
        clog(`failed to read user data from db: ${res ? res.statusCode : ''} ${error}`);
        callbacks.failure();
      }
    });
}

function loadParameters(callbacks) {
  clog('reading current model parameters from db');
  sendPostRequest(
    'http://127.0.0.1:4000/db/find',
    { json: { collection: 'parameters' } },
    (error, res, body) => {
      if (!error && res && res.statusCode === 200) {
        clog('successfully read parameters from db');
        let newParameters = {};
        if (body.length === 0) {
          // no parameters stored yet
          clog('no parameters found, starting with empty parameter set');
        } else if (body.length === 1) {
          if (!body[0].params) {
            console.error(`[learn] expected params document to have single params key`);
            callbacks.failure();
          }
          newParameters = body[0].params;
        } else {
          console.error(`[learn] expected to find single parameters doc, got ${body.length}`);
          return callbacks.failure();
        }
        callbacks.success(newParameters);
      } else {
        clog(`failed to read user data from db: ${res ? res.statusCode : ''} ${error}`);
        callbacks.failure();
      }
    });  
}

function updateParameters(options, callbacks) {
  // options.params
  // options.userData
  // options.model
  clog('running webppl model to update parameters');
  // TODO
  const newParameters = {};
  callbacks.success(newParameters)
}

function storeParameters(params, callbacks) {
  clog('storing new model parameters in db');
  // TODO
  callbacks.success();
}

function runLearner(model) {
  function failure() {
    clog('learner failed to complete iteration, starting over');
    setTimeout(runLearner, 2000);
  }
  loadUserData({
    success: (userData) => {
      loadParameters({
        success: (params) => {
          updateParameters({ params, userData, model }, {
            success: (newParams) => {
              storeParameters(newParams, {
                success: () => {
                  clog('successfully completed learner iteration');
                  setTimeout(runLearner, 1000);
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
      return clog('something bad happened', err);
    }
    clog(`running at http://localhost:${port}`);
  });

}


if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

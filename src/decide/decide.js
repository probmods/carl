'use strict';

// For now, this watches the `percepts` collection, then does some inference (using
// parameters from the `parameters` collection), and updates the `actions` collection

// TODO: split this into `infer` and `decide`
// - `infer` watches the `percepts` collection, updates the `posteriors` collection
// - `decide `watches the `posteriors` collection, updates the `actions` collection

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const sendPostRequest = require('request').post;

const app = express();
const port = 3002;


function failure(response, msg) {
  const message = `[decide] ${msg}`;
  console.error(message);
  return response.status(500).send(message);
}

function success(response, msg) {
  const message = `[decide] ${msg}`;
  console.log(message);
  return response.send(message);
}


function registerPerceptHandler() {
  const data = {
    callbackURL: 'http://127.0.0.1:3002/handle-percept',
    collection: 'percepts'
  };
  sendPostRequest(
    'http://localhost:4000/register-handler',
    { json: data },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log('[decide] successfully registered percept handler');
      } else {
        console.error(`[decide] failed to register percept handler, will try again`);
        setTimeout(registerPerceptHandler, 2000);
      }
    }
  );
}


function serve() {

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  registerPerceptHandler();

  app.post('/handle-percept', (request, response) => {
    const data = request.body;    
    if (!data.ops || data.ops.length != 1) {
      return failure(response, `can't handle percept: ${data}`);
    }
    const newPercept = data.ops[0];
    console.log('[decide] observed new percept', newPercept);
    // (-1. decide on simple model + space of questions)
    // (0. update perceive.html so that data corresponds to answer to a question)
    // 1. retrieve all percepts for user with email given in newPercept
    // 2. condition model on percepts
    // 3. compute new question based on all data points for this user
    return success(response, 'successfully received percept');
  });

  app.listen(port, () => {
    console.log(`[decide] running at http://localhost:${port}`);
  });

}

if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

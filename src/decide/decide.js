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

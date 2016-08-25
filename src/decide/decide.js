'use strict';

// For now, this watches the `percepts` collection, then does some inference (using
// parameters from the `parameters` collection), and updates the `actions` collection

// TODO: split this into `infer` and `decide`
// - `infer` watches the `percepts` collection, updates the `posteriors` collection
// - `decide `watches the `posteriors` collection, updates the `actions` collection

const _ = require('lodash');
const bodyParser = require('body-parser');
const colors = require('colors/safe');
const express = require('express');
const sendPostRequest = require('request').post;
const webppl = require('webppl');
const path = require('path');
const fs = require('fs');

const deciderCodePath = path.join(__dirname, 'inferrer-decider.wppl');
const deciderCode = fs.readFileSync(deciderCodePath, 'utf8');
const compiledModel = webppl.compile(deciderCode, {
  verbose: true,
  debug: true
});

const app = express();
const port = 3002;

function makeMessage(text) {
  return colors.red('[decide]') + ` ${text}`;;
}

function log(text) {
  console.log(makeMessage(text));
}

// NOTE: can factor out success/failure 
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


// Note: this can be factored out w/ data as a param
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


// 1. retrieve all percepts for user with email given in newPercept
// 2. condition model on percepts
// 3. compute new question based on all data points for this user
function inferNewAction (percepts, params, callback) {
  const prepared = webppl.prepare(
    compiledModel,
    (s, value) => {
      console.log(`webppl: ${value}`);
      callback(value);
    },
    { initialStore: { data: percepts.userData, params } }
  );
  prepared.run();
  //webppl.run(deciderCode, (s, x) => callback(x));
  // var w = process.exec("webppl " + deciderCodePath, function (error, stdout, stderr) {
  //   console.log(stdout);
  //   callback(JSON.parse(stdout));
  // });
  // w.on('exit', function(code) {
  //   console.log('Child process exited with exit code '+code);
  // });
}

// TODO: actually use newPercept, do inference 
function makeAction(newPercept, questionChoice) {
  var notifyTime = new Date();
  var headerString = IDToQuestionString(questionChoice.type);
  return {
    questionType: "slider",
    questionData: {headerString: headerString},
    datetime: questionChoice.time,
    email: newPercept.email,
    collection: 'actions',
    enacted: false
  };
};

function sendActionToStore (response, actionInfo) {
  sendPostRequest(
    'http://localhost:4000/db/insert',
    { json: actionInfo },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        return success(response, `successfully sent data to store: ${JSON.stringify(actionInfo)}`);
      } else {
        return failure(response, `error sending data to store: ${error} ${body}`);
      }
    }
  );
};

function questionStringToID(questionString) {
  return (questionString == "How good are you feeling?" ?
	  "mood" :
	  "prod");
}

function IDToQuestionString(ID) {
  return (ID == "mood" ?
	  "How good are you feeling?" :
	  "How productive are you right now?");
}

function preprocess(userEmail, body) {
  const groupedData = _.groupBy(body, 'email');
  const sortedData = _.mapValues(groupedData, (value, key) => {
    return _.sortBy(value, 'datetime');
  });
  const reformattedData = _.map(sortedData[userEmail], (observation) => {
    return _.fromPairs([[questionStringToID(observation["question"]),
			 observation["response"]]]);
  });
  return reformattedData;
}

function loadUserData(userEmail, callback) {
  console.log('[decide] reading user data from db');
  sendPostRequest(
    'http://127.0.0.1:4000/db/find',
    { json: { collection: 'percepts' , query: {email : userEmail} }},
    (error, res, body) => {
      if (!error && res && res.statusCode === 200) {
        console.log('successfully read user data from db');
	var processedData = preprocess(userEmail, body);
        callback(processedData);
      } else {
        console.log(`failed to read user data from db: ${res ? res.statusCode : ''} ${error}`);
        //callbacks.failure();
      }
    });
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
    console.log("[decide] Handling percept");		    
    const newPercept = data.ops[0];
    console.log(newPercept.email);
    loadParameters({
      success: (params) => {
        loadUserData(newPercept.email, (allPercepts) => {
          console.log('[decide] extracted all percepts for ' + newPercept.email);
          console.log(allPercepts);
          inferNewAction(allPercepts, params, (questionChoice) => {
            console.log(questionChoice);
            var actionObj = makeAction(newPercept, questionChoice);
            console.log('[decide] constructed new action', actionObj);
            sendActionToStore(response, actionObj);
          });
        });
      },
      failure: () => {
        console.error('[decide] failed to load parameters');
      }
    })
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

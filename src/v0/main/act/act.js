'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require("express");
const sendPostRequest = require('request').post;

const app = express();
const port = 3001;

const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const sgMail = require('sendgrid').mail;

const CronJob = require('cron').CronJob;


// NOTE: can factor out success/failure
function failure(response, msg) {
  const message = `[act] ${msg}`;
  console.error(message);
  return response.status(500).send(message);
}

function success(response, msg) {
  const message = `[act] ${msg}`;
  console.log(message);
  return response.send(message);
}

function notify(params) {
  console.log('notifying');
  const encQuestion = encodeURI(params.question);
  const encType = encodeURI(params.type);
  const perceiveURL = `http://localhost:3005/perceive.html?question=${encQuestion}&type=${encType}`;
  const fromEmail = new sgMail.Email('mail@sampleme.io');
  const toEmail = new sgMail.Email(params.email);
  const subject = `[SampleMe]: ${params.question}`;
  const content = new sgMail.Content('text/plain', perceiveURL);
  const mail = new sgMail.Mail(fromEmail, subject, toEmail, content);

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
}


function scheduleJob(response, params) {
  // convert uid and time to integers
  params.question = params.questionData.headerString;
  params.type = params.questionType;

  if (params.delta) {
    params.delta = parseInt(params.delta);
    params.time = _.now() + params.delta * 1000;
  }

  console.log(params);

  success(response, 'successfully scheduled notification');

  // TODO: use real scheduled time
  const soon = (_.now() + 1000);
  const job = new CronJob({
    cronTime: new Date(soon),
    onTick() {
      console.log(`[act] asking user ${params.email} question ${params.question}`);
      notify(params);
    },
    startNow: true, /* Start the job right now */
    timeZone: 'America/Los_Angeles'
  });
}

// Note: this can be factored out w/ data as a param
function registerActionHandler() {
  const data = {
    callbackURL: 'http://127.0.0.1:3001/handle-action',
    collection: 'actions'
  };
  sendPostRequest(
    'http://localhost:4000/register-handler',
    { json: data },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log('[act] successfully registered action handler');
      } else {
        console.error('[act] failed to register action handler, will try again');
        setTimeout(registerActionHandler, 2000);
      }
    }
  );
}

function serve() {
  if (process.env.SENDGRID_API_KEY === undefined) {
    console.error('[act] ERROR: environment key SENDGRID_API_KEY not found;' +
                  ' try running "source act/sendgrid.env" first');
    return;
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  registerActionHandler();

  app.post('/handle-action', (request, response) => {
    const data = request.body;
    if (!data.ops || data.ops.length !== 1) {
      return failure(response, `can't handle act: ${data}`);
    }
    const newAction = data.ops[0];
    console.log('[act] observed new action', newAction);
    scheduleJob(response, newAction);
  });

  app.listen(port, (err) => {
    if (err) {
      console.log('[act] something bad happened', err);
      return;
    }

    console.log(`[act] running at http://localhost:${port}`)
  });

}


if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

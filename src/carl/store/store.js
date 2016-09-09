'use strict'; // @flow

const _ = require('lodash');
const mongodb = require('mongodb');

const settings = require('../common/settings.js');
const util = require('../common/util.js');


const log = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue'
});

const error = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue',
  textColor: 'red'
});

const httpSuccess = util.makeHTTPResponder(200, log);

const httpFailure = util.makeHTTPResponder(500, error);


function mongoConnectWithRetry(client, delayInMilliseconds, callback) {
  client.connect(settings.mongoURL, (err, db) => {
    if (err) {
      error(`error connecting to mongodb: ${err}`);
      setTimeout(() => mongoConnectWithRetry(client, delayInMilliseconds, callback), delayInMilliseconds);
    } else {
      log('connected succesfully to mongodb');
      callback(db);
    }
  });
}


function checkRequestHasFields(request: Request, response: Response, requiredFields: [string], callback: ((body: Object) => any)) {
  if (requiredFields.length === 0) {
    return callback({});
  }
  if (!request.body || !(request.body instanceof Object)) {
    return httpFailure(response, 'POST request body not found');
  }
  for (var i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (request.body[field] === undefined) {
      return httpFailure(response, `required field '${field}' not found`);
    }
  }
  return callback(request.body);
}


function serveWithDatabase(database) {

  const handlers = {};
  
  function registerHandler(request: Request, response: Response): Response {
    return checkRequestHasFields(request, response, ['collection', 'callbackURL'], ({ collection, callbackURL }) => {
      if (handlers[collection] === undefined) {
        handlers[collection] = [];
      }
      if (_.includes(handlers[collection], callbackURL)) {
        return httpSuccess(response, `handler for ${collection} already registered: ${callbackURL}`);
      }
      handlers[collection].push(callbackURL);
      return httpSuccess(response, `added handler for ${collection}: ${callbackURL}`);
    });
  }

  function findOne(request: Request, response: Response): Response {
    return httpFailure(response, 'findOne not implemented');
  }

  function find(request: Request, response: Response): Response {
    return httpFailure(response, 'find not implemented');
  }

  function insert(request: Request, response: Response): Response {
    return httpFailure(response, 'insert not implemented');
  }

  const port = settings.addresses.store.port;
  const hostname = settings.addresses.store.hostname;

  util.runServer(
    { post: { registerHandler, findOne, find, insert }, port },
    () => { log(`running at http://${hostname}:${port}`); });
  
}

function serve(): void {
  const client = mongodb.MongoClient;
  mongoConnectWithRetry(client, 2000, serveWithDatabase);
}


if ((require: any).main === module) {
  serve();
}

module.exports = {
  serve
};

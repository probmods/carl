'use strict'; // @flow

import _ from 'lodash';
import mongodb from 'mongodb';

import http from '../common/http';
import settings from '../common/settings';
import util from '../common/util';


const log = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue'
});

const error = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue',
  textColor: 'red'
});

const httpSuccess = http.makeTextResponder(200, log);

const httpFailure = http.makeTextResponder(500, error);


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


function serveWithDatabase(database) {

  const handlers = {};
  
  function registerHandler(request: RequestWithBody, response: Response): Response {
    const success = (): Response => {
      const { collection, callbackURL } = request.body;
      if (handlers[collection] === undefined) {
        handlers[collection] = [];
      }
      if (_.includes(handlers[collection], callbackURL)) {
        return httpSuccess(response, `handler for ${collection} already registered: ${callbackURL}`);
      }
      handlers[collection].push(callbackURL);
      return httpSuccess(response, `added handler for ${collection}: ${callbackURL}`);      
    };
    const failure = (message: string): Response => {
      return httpFailure(response, message);
    };
    return http.checkPOSTRequestHasFields(request, ['collection', 'callbackURL'], success, failure);
  }

  function findOne(request: RequestWithBody, response: Response): Response {
    return httpFailure(response, 'findOne not implemented');
  }

  function find(request: RequestWithBody, response: Response): Response {
    return httpFailure(response, 'find not implemented');
  }

  function insert(request: RequestWithBody, response: Response): Response {
    return httpFailure(response, 'insert not implemented');
  }

  const port = settings.addresses.store.port;
  const hostname = settings.addresses.store.hostname;

  http.runServer(
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

export default {
  serve
};

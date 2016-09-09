'use strict'; // @flow

import _ from 'lodash';
import mongo from './mongo';

import http from '../common/http';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util';


function serveWithDB(db: MongoDB) {

  const handlers = {};

  function makeFieldFailure(response: Response) {
    return (message: string): Response => {
      return httpFailure(response, message);
    };
  }

  function parseQuery(request: RequestWithBody) {
    const collectionName = request.body.collection;
    const query: Object = request.body.query || {};
    const projection: Object = request.body.projection || {};
    const collection = db.collection(collectionName);
    return { query, projection, collection };
  }
  
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
    return http.checkRequestFields(request, ['collection', 'callbackURL'], makeFieldFailure(response), success);
  }

  function findOne(request: RequestWithBody, response: Response): ?Response {
    return http.checkRequestFields(request, ['collection'], makeFieldFailure(response), () => {
      const { collection, query, projection } = parseQuery(request);
      log(`got request to findOne in ${collection.s.name} with query ` +
          `${JSON.stringify(query)} and projection ${JSON.stringify(projection)}`);
      collection.findOne(query, projection, (err: mixed, data: Object) => {
        if (err) {
          httpFailure('error executing findOne');
        } else {
          response.json(data);
        }
      });
    });
  }

  function find(request: RequestWithBody, response: Response): ?Response {
    return http.checkRequestFields(request, ['collection'], makeFieldFailure(response), () => {
      const { collection, query, projection } = parseQuery(request);
      log(`got request to find in ${collection.s.name} with query ` +
          `${JSON.stringify(query)} and projection ${JSON.stringify(projection)}`);
      collection.find(query, projection).toArray((err: mixed, data: Array<Object>) => {
        if (err) {
          httpFailure('error executing find');
        } else {
          response.json(data);
        }
      });
    });
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
  const client = mongo.db.MongoClient;
  mongo.connectWithRetry(client, 2000, serveWithDB);
}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

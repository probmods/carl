'use strict'; // @flow

import _ from 'lodash';
import path from 'path';
import fs from 'fs'

import http from '../common/http';
import mongo from './mongo';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util';


function serveWithDB(db: MongoDB) {

  const handlers: {[key: string]: [string]} = {};

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

  function addFixtures() {
    const fixturePath = path.join(settings.appDirectory, 'fixtures.json');
    if (fs.existsSync(fixturePath)) { 
      const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      _.forEach(fixtures, (entries, collectionName) => {
        const collection = db.collection(collectionName);
        collection.count((err, count) => {
          if (!err && count === 0) {
            log(`inserting fixtures into ${collectionName}`);
            collection.insertMany(entries);
          }
        });
      }); 
    }      
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
          httpFailure(response, 'error executing findOne');
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
          return httpFailure(response, 'error executing find');  // Returns Response
        } else {
          return response.json(data);  // Returns Promise
        }
      });
    });
  }

  function insert(request: RequestWithBody, response: Response): Response {
    return http.checkRequestFields(request, ['collection'], makeFieldFailure(response), () => {
      const collectionName = request.body.collection;
      log(`got request to insert into ${collectionName}`);
      const collection = db.collection(collectionName);
      const data = _.omit(request.body, ['collection']);
      log(`inserting data: ${JSON.stringify(data)}`);
      return collection.insert(data, (err, result) => {
        if (err) {
          return httpFailure(response, `error inserting data: ${JSON.stringify(err)}`);
        } else {
          if (handlers[collectionName]) {
            handlers[collectionName].forEach((callbackURL) => {
              log(`calling ${collectionName} handler: ${callbackURL}`);
              http.sendPOSTRequest(callbackURL, result, (err2, result2, body) => {
                if (!err2 && result2 && result2.statusCode === 200) {
                  log(`successfully notified handler ${callbackURL}`);
                } else {
                  error(`error notifying ${callbackURL}: ${err2} ${body}`);
                }                
              });
            });
          };
          return httpSuccess(response, `successfully inserted data. result: ${JSON.stringify(result)}`);
        }
      });
    });
  }

  addFixtures();

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

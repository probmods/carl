'use strict'; // @flow

import mongodb from 'mongodb';
import settings from './settings';


function connectWithRetry(client: MongoClient, delayInMilliseconds: number, log: Logger, error: Logger, callback: (db: MongoDB) => void) {
  client.connect(settings.mongoURL, (err: mixed, db: MongoDB) => {
    if (err) {
      error(`error connecting to mongodb: ${JSON.stringify(err)}`);
      setTimeout(() => connectWithRetry(client, delayInMilliseconds, log, error, callback), delayInMilliseconds);
    } else {
      log('connected succesfully to mongodb');
      callback(db);
    }
  });
}


export default {
  connectWithRetry,
  db: mongodb
};

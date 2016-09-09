'use strict'; // @flow

import mongodb from 'mongodb';
import settings from '../common/settings';
import { log, error } from './util';



function connectWithRetry(client: MongoClient, delayInMilliseconds: number, callback: (db: MongoDB) => void) {
  client.connect(settings.mongoURL, (err: mixed, db: MongoDB) => {
    if (err) {
      error(`error connecting to mongodb: ${err}`);
      setTimeout(() => connectWithRetry(client, delayInMilliseconds, callback), delayInMilliseconds);
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

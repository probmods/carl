'use strict'; // @flow

import path from 'path';


const appName = 'simple-example';
const appDirectory = path.join(__dirname, '../..', 'applications/', appName);
const app = require(path.join(appDirectory, 'app.js'));

const settings = {
  mongoURL: `mongodb://localhost:27017/${appName}`,
  addresses: {
    store: {
      hostname: 'localhost',
      port: 4000
    },
    observe: {
      hostname: 'localhost',
      port: 3001
    },
    learn: {
      hostname: 'localhost',
      port: 3002
    },
    infer: {
      hostname: 'localhost',
      port: 3003
    }    
  },
  appDirectory,
  app
};


module.exports = settings;

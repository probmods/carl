'use strict'; // @flow

import path from 'path';


const appName = 'simple-example';

const settings = {
  mongoURL: `mongodb://localhost:27017/${appName}`,
  addresses: {
    store: {
      hostname: 'localhost',
      port: 4000
    },
    perceive: {
      hostname: 'localhost',
      port: 3001
    }
  },
  appDirectory: path.join(__dirname, '../..', 'applications/', appName)
};


module.exports = settings;

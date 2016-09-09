'use strict'; // @flow


const appName = 'simple-example';

const settings = {
  mongoURL: `mongodb://localhost:27017/${appName}`,
  addresses: {
    store: {
      hostname: 'localhost',
      port: 4000
    }
  }
};


module.exports = settings;

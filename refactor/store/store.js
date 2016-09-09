'use strict'; // @flow

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

  function registerHandler(request, response) {
    error('register-handler not implemented');
  }

  function findOne(request, response) {
    error('findOne not implemented');
  }

  function find(request, response) {
    error('find not implemented');
  }

  function insert(request, response) {
    error('insert not implemented');
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

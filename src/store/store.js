const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const mongodb = require('mongodb');

const app = express();
const MongoClient = mongodb.MongoClient;
const port = 4000;
const mongoURL = 'mongodb://localhost:27017/sampleme';
var database = null;


function failure(response, msg) {
  const message = `[store] ${msg}`;
  console.error(message);
  return response.status(500).send(message);  
}

function success(response, msg) {
  const message = `[store] ${msg}`;
  console.log(message);
  return response.send(message);    
}


function mongoConnectWithRetry(delayInMilliseconds) {
  MongoClient.connect(mongoURL, (err, db) => {
    if (err) {
      console.error(`Error connecting to MongoDB: ${err}`);
      setTimeout(() => mongoConnectWithRetry(delayInMilliseconds), delayInMilliseconds);
    } else {
      console.log("[store] connected succesfully to mongodb");
      database = db;
    }
  });
}

mongoConnectWithRetry(2000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/register-handler', (request, response) => {
  return failure(response, 'register-handler not implemented yet');
});


app.post('/db/insert', (request, response) => {
  if (!request.body) {
    return failure(response, '/db/insert needs post request body');
  }
  if (!request.body.collection) {
    return failure(response, '/db/insert needs collection');
  }
  console.log(`[store] got request to insert into ${request.body.collection}`);  
  const collection = database.collection(request.body.collection);
  const data = _.omit(request.body, ['collection']);
  console.log(`[store] inserting data: ${JSON.stringify(data)}`);
  collection.insert(data, (err, result) => {
    if (err) {
      return failure(response, `error inserting data: ${error}`);
    } else {
      return success(response, `successfully inserted data. result: ${JSON.stringify(result)}`);
    }
  });  
});


app.listen(port, () => {
  console.log(`[store] running at http://localhost:${port}/`);
});

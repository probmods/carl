const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const sendPostRequest = require('request').post;

const app = express();
const port = 3001;


function failure(response, msg) {
  const message = `[perceive] ${msg}`;
  console.error(message);
  return response.status(500).send(message);  
}

function success(response, msg) {
  const message = `[perceive] ${msg}`;
  console.log(message);
  return response.send(message);    
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/', (request, response) => {
  if (!request.body) {
    return failure(response, 'need post request body');
  }
  if (!request.body.uid) {
    return failure(response, 'need uid');
  }
  // Send data to store
  const postData = _.assign({}, request.body, { collection: 'userData' });
  sendPostRequest(
    'http://localhost:4000/db/insert',
    { json: postData },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        return success(response, `sent data to store: ${JSON.stringify(request.body)}`);
      } else {
        return failure(response, `error sending data to store: ${error} ${body}`);
      }
    }
  );
});


app.listen(port, () => {
  console.log(`[perceive] running at http://localhost:${port}/`);
});

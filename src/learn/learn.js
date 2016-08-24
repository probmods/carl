const http = require('http');
const fs = require('fs');
const path = require('path');
const webppl = require('webppl');
const sendPostRequest = require('request').post;

const port = 3004;


function clog(x) {
  console.log('[learn] ' + x);
}

function requestHandler(request, response) {
  const url = request.url;
  // optionally do something (maybe report on inference progress so far?)
}

const interval = 3 * 1000; // seconds

const learnerCodePath = path.join(__dirname, 'learner.wppl');
const learnerCode = fs.readFileSync(learnerCodePath, 'utf8');


const compiled = webppl.compile(learnerCode, {
  verbose: true,
  debug: true
});

function updateBeliefs(responses) {
  const prepared = webppl.prepare(
    compiled,
    (s, x) => {
      clog(JSON.stringify(s.output))
    },
    {initialStore: {input: responses}}
  );
  prepared.run();
}

const responses = [];

setInterval(function() {
  clog('reading from db');
  sendPostRequest(
    'http://127.0.0.1:4000/db/find',
    {json: {collection: 'percepts'}},
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        clog('db read success');
      } else {
        clog(`db read error:`);
        console.log(res.statusCode);
        console.log(error)
      }
    });

  // responses.push(Math.random());

  // clog('learning');
  // updateBeliefs(responses);

  // clog('writing to db (TODO)');
}, interval);


function serve() {

  const server = http.createServer(requestHandler);

  server.listen(port, (err) => {
    if (err) {
      return clog('something bad happened', err)
    }

    clog(`running at http://localhost:${port}`)
  });

}


if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

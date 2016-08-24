const http = require('http');
const port = 3004;
const fs = require('fs');
var webppl = require('webppl');
const sendPostRequest = require('request').post;

// a terrible hack because fs.readFileSync('learner.wppl','utf8')
// doesn't work from the main runner that starts all five servers
// TODO: switch to the __dirname method
var learnerSource = function() {
  var globalInput = globalStore.input;
  var globalOutput = {theta: gaussian(globalInput.length, 0.1)};
  globalStore['output'] = globalOutput;
};

var clog = function(x) {
  console.log('[learn] ' + x);
}

function requestHandler(request, response) {
  var url = request.url;
  // optionally do something (maybe report on inference progress so far?)
}

var interval = 3 * 1000; // seconds

var code = ['(',learnerSource.toString(),')','()'].join('');
var compiled = webppl.compile(code, {verbose: true,
                                     debug: true
                                    });

var updateBeliefs = function(responses) {
  var prepared = webppl.prepare(compiled,
                                function(s, x) {
                                  clog(JSON.stringify(s.output))
                                },
                                {initialStore: {input: responses}}
                               )
  prepared.run();
}

var responses = [];

setInterval(function() {
  clog('reading from db');
  sendPostRequest('http://127.0.0.1:4000/db/find',
                  {json: {collection: 'percepts'}},
                  (error, res, body) => {
                    if (!error && res.statusCode === 200) {
                      clog('db read success');
                    } else {
                      clog(`db read error:`);
                      console.log(res.statusCode);
                      console.log(error)
                    }
                  })

  // responses.push(Math.random());

  // clog('learning');
  // updateBeliefs(responses);

  // clog('writing to db (TODO)');
}, interval)

function serve() {

  const server = http.createServer(requestHandler);

  server.listen(port, (err) => {
    if (err) {
      return clog('something bad happened', err)
    }

    clog(`running at http://localhost:${port}`)
  })

}

if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

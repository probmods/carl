
const http = require('http')
const _ = require('underscore')
const port = 3001

var CronJob = require('cron').CronJob;

const requestHandler = (request, response) => {
  var url = request.url

  var urlSplit = url.split("/?");
  if (urlSplit.length == 1) {
    response.end('no action taken')
  } else {
    var paramsString = _.last(urlSplit),
        params = _.object(_.map(paramsString.split("&"),
                                    function(s) { return s.split("=") }));

    // convert uid and time to integers
    params.uid = parseInt(params.uid);
    params.time = parseInt(params.time);

    if (params.delta) {
      params.delta = parseInt(params.delta);
      params.time = _.now() + params.delta * 1000;
    }

    console.log(params);
    response.end('scheduled notification');

    var job = new CronJob({
      cronTime: new Date(params.time),
      onTick: function() { console.log('asking user ' + params.uid + ' question ' + params.question)  },
      startNow: true, /* Start the job right now */
      timeZone: 'America/Los_Angeles'
    });
  }


}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

const http = require('http');
const _ = require('underscore');
const port = 3001;
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var sgMail = require('sendgrid').mail;

var CronJob = require('cron').CronJob;


function notify(uid, question) {

  var from_email = new sgMail.Email('mail@sampleme.io'),
      to_email = new sgMail.Email('longouyang@gmail.com'),
      subject = '[SampleMe]: ' + question,
      content = new sgMail.Content('text/plain', question),
      mail = new sgMail.Mail(from_email, subject, to_email, content)

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode)
    console.log(response.body)
    console.log(response.headers)
  })
}


function requestHandler(request, response) {
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
      onTick: function() {
        console.log('[act] asking user ' + params.uid + ' question ' + params.question);
        notify(params.uid, params.question)
      },
      startNow: true, /* Start the job right now */
      timeZone: 'America/Los_Angeles'
    });
  }
}


function serve() {
  const server = http.createServer(requestHandler);

  server.listen(port, (err) => {
    if (err) {
      return console.log('[act] something bad happened', err)
    }

    console.log(`[act] running at http://localhost:${port}`)
  })

}


if (require.main === module) {
  serve();
}

module.exports = {
  serve
};

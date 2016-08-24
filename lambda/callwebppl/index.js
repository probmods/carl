'use strict';
console.log('Loading function');

var webppl = require('webppl');

exports.handler = (event, context) => {
  console.log(event)
  webppl.run("flip(.5)", function(s, x) {
    context.done(null, "webppl returned: " + x + "");
  });

  // console.log('Received event:', JSON.stringify(event, null, 2));
  //webppl.run(event.program, function(s, x) {return callback(null, x)});

};

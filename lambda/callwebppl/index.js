'use strict';
console.log('Loading function');

//var webppl = require('webppl');
//console.log(webppl);

/**
 * Provide an event that contains the following keys:
 *
 *   - program: webPPL program (represented as string)
 */
exports.handler = (event, context) => {
  context.done(null, "hello world");
  // console.log('Received event:', JSON.stringify(event, null, 2));
  //webppl.run(event.program, function(s, x) {return callback(null, x)});
  // webppl.run("flip(.5)", function(s, x) {
  //   
  // });
};

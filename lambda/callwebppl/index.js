'use strict';
console.log('Loading function');

var webppl = require('webppl');

/**
 * Provide an event that contains the following keys:
 *   - program: webPPL program (represented as string)
 */
exports.handler = (event, context) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));
  webppl.run("flip(.5)", function(s, x) {
    return context.done(null, "Returned val:" + x);
  });
};

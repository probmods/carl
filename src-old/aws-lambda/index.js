'use strict';
console.log('Loading function');

var webppl = require('webppl');

/**
 * Provide an event that contains the following keys:
 *   - program: webPPL program (represented as string)
 */
exports.handler = (event, context) => {
  console.log(event);
  webppl.run(event.program, function(s, x) {
    // first argument is null because context.done expects an error 
    return context.done(null, "webppl returned:" + x);
  });
};

'use strict';
console.log('Loading function');

var webppl = require('webppl');

/**
 * Provide an event that contains the following keys:
 *   - program: webPPL program (represented as string)
 */
exports.handler = (event, context) => {
  webppl.run("flip(.5)", function(s, x) {
    return context.done(null, "webppl returned:" + x);
  });
};

'use strict';
console.log('Loading function');

exports.handler = (event, context) => {
  context.done(null, "hello world");
};

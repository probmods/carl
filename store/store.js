'use strict';
// @flow

const util = require('../common/util.js');

const log = util.makeLogger({ prefix: 'store', prefixColor: 'blue' });

const error = util.makeLogger({ prefix: 'store', prefixColor: 'blue', textColor: 'red' });


function serve(): void {
  util.hi('hi');
  log('hi');
  error('oops');
}

if ((require: any).main === module) {
  serve();
}

module.exports = {
  serve
};

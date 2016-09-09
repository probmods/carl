'use strict';
// @flow

const common = require('../common/common.js');


function serve(): void {
  common.hi('hi from common');
  console.log('hi from act');
}

if ((require: any).main === module) {
  serve();
}

module.exports = {
  serve
};

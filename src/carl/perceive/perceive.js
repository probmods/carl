'use strict'; // @flow

import { log, error, httpSuccess, httpFailure } from './util'; 

function serve() {
  log('perceive started');
}

if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

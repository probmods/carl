'use strict'; // @flow

import testWebPPL from './test-webppl';


function runAll() {
  testWebPPL.test();
  console.log('\nAll tests passed.');
}


runAll();

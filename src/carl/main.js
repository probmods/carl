'use strict'; // @flow

import perceive from './perceive/perceive';
import store from './store/store';


function main() {
  store.serve();
  perceive.serve();
}


main();

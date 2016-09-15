'use strict'; // @flow

import learn from './learn/learn';
import perceive from './perceive/perceive';
import store from './store/store';


function main() {
  store.serve();
  perceive.serve();
  learn.serve();
}


main();

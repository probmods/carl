'use strict'; // @flow

import learn from './learn/learn';
import observe from './observe/observe';
import store from './store/store';


function main() {
  store.serve();
  observe.serve();
  learn.serve();
}


main();

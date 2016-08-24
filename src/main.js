const act = require('./act/act.js');
const decide = require('./decide/decide.js');
const infer = require('./infer/infer.js');
const learn = require('./learn/learn.js');
const perceive = require('./perceive/perceive.js');
const store = require('./store/store.js');

function main() {
  act.serve();
  decide.serve();
  infer.serve();
  learn.serve();
  perceive.serve();
  store.serve();
}

main();

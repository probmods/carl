'use strict'; // @flow

import util from '../common/util';
import http from '../common/http';


const log = util.makeLogger({
  prefix: 'perceive',
  prefixColor: 'green'
});

const error = util.makeLogger({
  prefix: 'perceive',
  prefixColor: 'green',
  textColor: 'red'
});

const httpSuccess = http.makeTextResponder(200, log);

const httpFailure = http.makeTextResponder(500, error);


export {
  log,
  error,
  httpSuccess,
  httpFailure
};

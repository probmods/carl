import util from '../common/util';
import http from '../common/http';


const log = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue'
});

const error = util.makeLogger({
  prefix: 'store',
  prefixColor: 'blue',
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

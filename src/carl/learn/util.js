import util from '../common/util';
import http from '../common/http';


const log = util.makeLogger({
  prefix: 'learn',
  prefixColor: 'yellow'
});

const error = util.makeLogger({
  prefix: 'learn',
  prefixColor: 'yellow',
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

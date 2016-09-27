'use strict'; // @flow

import http from '../common/http';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util'; 


function serve() {

  const port = settings.addresses.observe.port;
  const hostname = settings.addresses.observe.hostname;
  
  http.runServer(
    { port },
    () => { log(`running at http://${hostname}:${port}`); });

}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

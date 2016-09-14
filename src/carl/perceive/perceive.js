'use strict'; // @flow

import http from '../common/http';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util'; 


function serve() {

  function addPercept(request: RequestWithBody, response: Response): Response {
    return httpFailure(response, 'addPercept not implemented yet');
  }

  const port = settings.addresses.perceive.port;
  const hostname = settings.addresses.perceive.hostname;
  
  http.runServer(
    { post: { addPercept }, port },
    () => { log(`running at http://${hostname}:${port}`); });  
}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

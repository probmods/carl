'use strict'; // @flow

import http from '../common/http';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util';


function registerObservationHandler(hostname, port) {

  const storeURL = (`http://${settings.addresses.store.hostname}:` +
                    `${settings.addresses.store.port}/registerHandler`);
  
  const data = {
    callbackURL: `http://${hostname}:${port}/handleObservation`,
    collection: 'observations'
  };

  http.sendPOSTRequest(storeURL, data, (err, result, body) => {
    if (!err && result && result.statusCode === 200) {
      log('successfully registered observation handler');
    } else {
      error(`failed to register observation handler, will try again`);
      setTimeout(registerObservationHandler, 2000);
    }
  });

}


function serve() {

  const hostname = settings.addresses.infer.hostname;
  const port = settings.addresses.infer.port;

  function handleObservation(request: RequestWithBody, reponse: Response): ?Response {
    log(`received observation: ${JSON.stringify(request.body)}`);
  }

  registerObservationHandler(hostname, port);
  
  http.runServer(
    { post: { handleObservation }, port },
    () => { log(`running at http://${hostname}:${port}`); });

}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

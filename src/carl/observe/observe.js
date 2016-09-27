'use strict'; // @flow

import _ from 'lodash';

import http from '../common/http';
import settings from '../common/settings';
import { log, error, httpSuccess, httpFailure } from './util'; 


function serve() {

  function makeFieldFailure(response: Response) {
    return (message: string): Response => {
      return httpFailure(response, message);
    };
  }  

  function addObservation(request: RequestWithBody, response: Response): ?Response {
    log(`received observation: ${JSON.stringify(request.body)}`);
    const requiredFields = settings.app.observe.requiredFields;
    return http.checkRequestFields(request, requiredFields, makeFieldFailure(response), () => {
      const postData = _.assign(_.pick(request.body, requiredFields), {
        collection: 'observations',
        datetime: new Date()
      });
      log(`looks good, sending observation to store`);
      const storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}/insert`;
      http.sendPOSTRequest(storeURL, postData, (err, result, body) => {
        if (!err && result && result.statusCode === 200) {
          httpSuccess(response, `successfully sent observation to store`);
        } else {
          httpFailure(response, `error sending observation to store: ${err} ${JSON.stringify(body)}`);
        }                
      });
    });
  }

  const port = settings.addresses.observe.port;
  const hostname = settings.addresses.observe.hostname;
  
  http.runServer(
    { post: { addObservation }, port },
    () => { log(`running at http://${hostname}:${port}`); });  
}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

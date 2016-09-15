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

  function addPercept(request: RequestWithBody, response: Response): ?Response {
    log(`received percept: ${JSON.stringify(request.body)}`);
    const requiredFields = settings.app.perceive.requiredFields;
    return http.checkRequestFields(request, requiredFields, makeFieldFailure(response), () => {
      const postData = _.assign(_.pick(request.body, requiredFields), {
        collection: 'percepts',
        datetime: new Date()
      });
      log(`looks good, sending percept to store`);
      const storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}/insert`;
      http.sendPOSTRequest(storeURL, postData, (err, result, body) => {
        if (!err && result && result.statusCode === 200) {
          httpSuccess(response, `successfully sent percept to store`);
        } else {
          httpFailure(response, `error sending percept to store: ${err} ${body}`);
        }                
      });
    });
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

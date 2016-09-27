import http from './http';
import settings from './settings';

import type MapOfObservations from './typedefs/carl';


const storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}`;


function checkStoreResponse(err, result) {
  if (err) {
    return err;
  }
  if (!result) {
    return 'got empty result';
  }
  if (result.statusCode !== 200) {
    return `got status code: ${result.statusCode}`;
  }  
  return null;
}

function loadObservations(log, error): Promise<MapOfObservations> {
  log('loading observations');
  const postData = {
    collection: 'observations'
  };
  return new Promise((resolve, reject) => {
    http.sendPOSTRequest(`${storeURL}/find`, postData, (err, result, body) => {
      // Error checking
      const errorMessage = checkStoreResponse(err, result);
      if (errorMessage) {
        return reject(`loadObservations: ${errorMessage}`);
      }
      if (!(body instanceof Array)) {
        return reject(`loadObservations: expected array response, got ${body}`);
      }        
      // Return observations
      log(`${body.length} observations found`);
      const observations = settings.app.learn.prepareObservations(body);
      log(`observations: ${JSON.stringify(observations)}`);
      return resolve(observations);
    });
  });
}

function loadParameters(log, error): Promise<Object> {
  log('loading parameters');
  const postData = {
    collection: 'parameters',
    projection: { sort: { '$natural': -1 } }
  };
  return new Promise((resolve, reject) => {
    http.sendPOSTRequest(`${storeURL}/findOne`, postData, (err, result, body) => {
      // Error checking
      const errorMessage = checkStoreResponse(err, result);
      if (errorMessage) { return reject(`loadParameters: ${errorMessage}`); }
      // Return params
      if (!body) {
        log('no parameters found, starting with empty parameter set');
        return resolve({});
      } else {
        if (!(body instanceof Object)) {
          return reject(`loadParameters: expected object response, got ${body}`);
        }
        if (!body.params || !(body.params instanceof Object)) {
          return reject(`loadParameters: expected return object to have 'params' property, got ${body}`);
        }
        log(`response: ${JSON.stringify(body)}`);
        return resolve(body.params);
      }
    });
  });
}


export {
  checkStoreResponse,
  loadObservations,
  loadParameters
}

'use strict'; // @flow

import fs from 'fs';
import path from 'path';

import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { log, error, httpSuccess, httpFailure } from './util'; 


type MapOfObservations = { [key: string]: Array<Object> };


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


class Learner {

  // add type for 'compiled' here
  compiled: mixed
  storeURL: string

  constructor(options) {
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);
    this.storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}`;
  }

  loadModelCode(): string {
    const commonCode = fs.readFileSync(path.join(settings.appDirectory, 'common.wppl'), 'utf-8');
    const learnerCode = fs.readFileSync(path.join(settings.appDirectory, 'learn.wppl'), 'utf-8');
    return `${commonCode}\n${learnerCode}`;
  }  
  
  async loadObservations(): Promise<MapOfObservations> {
    log('loading observations');
    const postData = {
      collection: 'percepts'
    };
    return new Promise((resolve, reject) => {
      http.sendPOSTRequest(`${this.storeURL}/find`, postData, (err, result, body) => {
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

  async loadParameters(): Promise<Object> {
    log('loading parameters');
    const postData = {
      collection: 'parameters',
      projection: { sort: { '$natural': -1 } }
    };
    return new Promise((resolve, reject) => {
      http.sendPOSTRequest(`${this.storeURL}/findOne`, postData, (err, result, body) => {
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

  async updateParameters(params: Object, observations: MapOfObservations): Promise<Object> {
    log('updating parameters');
    return new Promise((resolve, reject) => {
      webppl.run(this.compiled, { initialStore: { params, observations }}, (err: ?string, value: any) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(value);
        }
      });          
    });            
  }

  async storeParameters(params) {
    log('storing params');
    const postData = {
      collection: 'parameters',
      datetime: new Date(),
      params
    };
    return new Promise((resolve, reject) => {
      http.sendPOSTRequest(`${this.storeURL}/insert`, postData, (err, result, body) => {
        const errorMessage = checkStoreResponse(err, result);
        if (errorMessage) { return reject(`storeParameters: ${errorMessage}`); }        
        log(`stored new params: ${JSON.stringify(params)}`);
        resolve();
      });
    });            
  }

  async run() {
    try {
      const observations: MapOfObservations = await this.loadObservations();
      const oldParams: Object = await this.loadParameters();
      const newParams: Object = await this.updateParameters(oldParams, observations);
      await this.storeParameters(newParams);
      log('successfully completed learner iteration');
    } catch (err) {
      error(err);
    }
    setTimeout(() => this.run(), 1000);
  }
  
}


function serve() {

  const port = settings.addresses.learn.port;
  const hostname = settings.addresses.learn.hostname;

  const learner = new Learner();
  
  learner.run();

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

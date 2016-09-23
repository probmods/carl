'use strict'; // @flow

import fs from 'fs';
import path from 'path';

import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { log, error, httpSuccess, httpFailure } from './util'; 


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

  loadModelCode() {
    const commonCode = fs.readFileSync(path.join(settings.appDirectory, 'common.wppl'), 'utf-8');
    const learnerCode = fs.readFileSync(path.join(settings.appDirectory, 'learn.wppl'), 'utf-8');
    return `${commonCode}\n${learnerCode}`;
  }  
  
  async loadObservations() {
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
        return resolve(body);
      });
    });
  }

  async loadParameters() {
    log('loading parameters');
    const postData = {
      collection: 'parameters',
      query: {
        '$orderby': { '$natural': -1 },
        '$query': {} }
    };
    return new Promise((resolve, reject) => {
      http.sendPOSTRequest(`${this.storeURL}/findOne`, postData, (err, result, body) => {
        // Error checking
        const errorMessage = checkStoreResponse(err, result);
        if (errorMessage) { return reject(`loadParameters: ${errorMessage}`); }
        // Return params
        if (!body) {
          log('no parameters found, starting with empty parameter set');
        }
        return resolve(body);
      });
    });    
  }

  async updateParameters(oldParams, observations) {
    log('updateParameters');
    return new Promise((resolve, reject) => {
      /* webppl.run(compiled, { initialStore: { params: XXX }}, (error: ?string, value: any) => {k
         // ...
         });     */      
      resolve('updateParameters-result');
    });        
  }

  async storeParameters() {
    log('storeParameters');
    return new Promise((resolve, reject) => {
      resolve('storeParameters-result');
    });            
  }

  async run() {
    try {
      const observations = await this.loadObservations();
      const oldParams = await this.loadParameters();
      const newParams = await this.updateParameters(oldParams, observations);
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

  const learner = new Learner();  // options
  
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

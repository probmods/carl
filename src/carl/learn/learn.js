'use strict'; // @flow

import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { loadObservations, loadParameters, checkStoreResponse } from '../common/load';
import { log, error, httpSuccess, httpFailure } from './util'; 


class Learner {

  // add type for 'compiled' here
  compiled: mixed;
  storeURL: string;

  constructor() {
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);
    this.storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}`;
  }

  loadModelCode(): string {
    const commonCode = fs.readFileSync(path.join(settings.appDirectory, 'common.wppl'), 'utf-8');
    const learnerCode = fs.readFileSync(path.join(settings.appDirectory, 'learn.wppl'), 'utf-8');
    return `${commonCode}\n${learnerCode}`;
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
      const observations: MapOfObservations = await loadObservations(log, error);
      const oldParams: Object = await loadParameters(log, error);
      let newParams: Object = await this.updateParameters(oldParams, observations);
      newParams = _.pick(newParams, settings.app.learn.parameterNames);  // Only store named params, not auto mean field params
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

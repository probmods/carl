'use strict'; // @flow

import fs from 'fs';
import path from 'path';

import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { log, error, httpSuccess, httpFailure } from './util'; 


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
    log('loadObservations');
    return new Promise((resolve, reject) => {
      resolve('loadObservations-result');
    });
  }

  async loadParameters() {
    log('loadParameters');
    const storeFindOneURL = `${this.storeURL}/findOne`;
    const postData = {
      collection: 'parameters',
      query: {
        '$orderby': { '$natural': -1 },
        '$query': {} }
    };
    return new Promise((resolve, reject) => {
      http.sendPOSTRequest(storeFindOneURL, postData, (err, result, body) => {
        if (!err && result && result.statusCode === 200) {
          let newParams = undefined;
          if (!body) {
            log('no parameters found, starting with empty parameter set');
          } else {
            if (!body.params) {
              return reject('expected params document to have single params key');
            } else {
              newParams = body.params;
            }
          }
          return resolve(newParams);          
        } else {
          return reject(err);
        }                
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

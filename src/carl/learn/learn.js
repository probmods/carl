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

  constructor(options) {
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);    
  }

  loadModelCode() {
    const commonCode = fs.readFileSync(path.join(settings.appDirectory, 'common.wppl'), 'utf-8');
    const learnerCode = fs.readFileSync(path.join(settings.appDirectory, 'learn.wppl'), 'utf-8');
    return `${commonCode}\n${learnerCode}`;
  }  
  
  async loadObservations() {
    console.log('loadObservations');
    return new Promise((resolve, reject) => {
      resolve('loadObservations-result');
    });
  }

  async loadParameters() {
    console.log('loadParameters');
    return new Promise((resolve, reject) => {
      resolve('loadParameters-result');
    });    
  }

  async updateParameters(oldParams, observations) {
    console.log('updateParameters');
    return new Promise((resolve, reject) => {
      /* webppl.run(compiled, { initialStore: { params: XXX }}, (error: ?string, value: any) => {k
         // ...
         });     */      
      resolve('updateParameters-result');
    });        
  }

  async storeParameters() {
    console.log('storeParameters');
    return new Promise((resolve, reject) => {
      resolve('storeParameters-result');
    });            
  }

  async run() {
    const observations = await this.loadObservations();
    const oldParams = await this.loadParameters();
    const newParams = await this.updateParameters(oldParams, observations);
    await this.storeParameters(newParams);
    log('successfully completed learner iteration');
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

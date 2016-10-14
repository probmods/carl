'use strict'; // @flow

import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import mongo from '../common/mongo';
import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import util from '../common/util';
import { loadObservations as loadDataFromDB } from '../common/load';
import { log, error, httpSuccess, httpFailure } from './util'; 


class Learner {

  compiled: Compiled;
  db: MongoDB;
  histories: { [key: number]: Array<mixed> };
  name: string;

  constructor(db: MongoDB) {
    this.db = db;
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);
    this.histories = {};
    this.name = util.randomName();
    log(`my name is ${this.name}`);
  }

  loadModelCode(): string {
    const read = file => fs.readFileSync(path.join(settings.appDirectory, file), 'utf-8');
    const commonCode = read('common.wppl');
    const learnerCode = read('learn.wppl');
    return `${commonCode}\n${learnerCode}`;
  }

  saveHistory(history) {
    this.histories[Date.now()] = history;
    const fn = `carl-${settings.appName}-${this.name}-histories.json`;
    const fp = path.join(settings.tempDirectory, fn);
    fs.writeFileSync(fp, JSON.stringify(this.histories));
  }
  
  updateParameters(params: ?Params, data: Object): Promise<Object> {
    log('updating parameters');
    const initialStore = {
      params,
      data,
      settings: settings.app.learn.webppl,
      saveHistory: this.saveHistory.bind(this)
    };
    return new Promise((resolve, reject) => {
      webppl.run(this.compiled, { initialStore }, (err: ?string, value: any) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(value);
        }
      });          
    });            
  }

  loadParameters(): Promise<?Params> {
    const collection = this.db.collection('parameters');
    return new Promise((resolve, reject) => {
      collection.findOne({ _id: 0 }, {}, (err: mixed, data: ?Object) => {
        if (err) {
          reject(err);
        } else {
          resolve(data ? data.currentParams : null);
        }
      });
    });
  }

  async storeParameters(oldParams: ?Params, newParams: Params) {    
    
    // 1. Load most recent parameters from DB
    const collection = this.db.collection('parameters');
    const curParams: ?Object = await this.loadParameters();
    
    // 2. Apply deltas
    let paramsToStore = newParams;    
    if (oldParams && curParams) {
      log('storing param deltas');
      _.forEach(curParams, (paramArray, paramName) => {
        _.forEach(paramArray, (paramTensor, i) => {
          _.forEach(paramTensor.data, (newParamValue, j) => {
            const curValue = curParams[paramName][i].data[j];
            const oldValue = oldParams[paramName][i].data[j];
            const newValue = newParams[paramName][i].data[j];
            paramsToStore[paramName][i].data[j] = curValue + (newValue - oldValue);
          });
        });
      });
    } else {
      log('storing params (not deltas)');
    }
    
    // 3. Store updated parameters in DB
    return new Promise((resolve, reject) => {
      const next = (err: mixed, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
      collection.update({ _id: 0 }, { currentParams: paramsToStore }, { upsert: true }, next);
    });
  }

  loadData() {
    if (settings.app.learn.data) {
      return settings.app.learn.data;
    } else {
      return loadDataFromDB(log, error);
    }
  }

  async run() {
    try {
      const data: Object = await this.loadData();
      const oldParams: ?Object = await this.loadParameters();
      let newParams: Object = await this.updateParameters(oldParams, data);
      if (settings.app.learn.parameterNames) {
        // Only store named params, not auto mean field params
        newParams = _.pick(newParams, settings.app.learn.parameterNames);
      }
      await this.storeParameters(oldParams, newParams);
      log('successfully completed learner iteration');
    } catch (err) {
      error(err);
    }
    setTimeout(() => this.run(), 0);
  }
  
}


function serve() {
  const client = mongo.db.MongoClient;
  mongo.connectWithRetry(client, 2000, log, error, (db) => {
    const learner = new Learner(db);
    learner.run();
  });
}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

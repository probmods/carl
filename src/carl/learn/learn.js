'use strict'; // @flow

import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import mongo from '../common/mongo';
import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { loadObservations as loadDataFromDB } from '../common/load';
import { log, error, httpSuccess, httpFailure } from './util'; 


class Learner {

  compiled: Compiled;
  storeURL: URL;
  db: MongoDB;

  constructor(db: MongoDB) {
    this.db = db;
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);
    this.storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}`;
  }

  loadModelCode(): string {
    const read = file => fs.readFileSync(path.join(settings.appDirectory, file), 'utf-8');
    const commonCode = read('common.wppl');
    const learnerCode = read('learn.wppl');
    return `${commonCode}\n${learnerCode}`;
  }  
  
  updateParameters(params: ?Params, data: Object): Promise<Object> {
    log('updating parameters');
    return new Promise((resolve, reject) => {
      webppl.run(this.compiled, { initialStore: { params, data }}, (err: ?string, value: any) => {
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
      collection.findOne({}, {}, (err: mixed, data: ?Object) => {
        if (err) {
          reject(err);
        } else {
          resolve(data ? data.currentParams : null);
        }
      });
    });
  }

  computeDeltas(oldParams: Params, newParams: Params): Object {
    const deltas = {};
    _.forEach(newParams, (paramArray, paramName) => {
      _.forEach(paramArray, (paramTensor, tensorIndex) => {
        _.forEach(paramTensor.data, (newParamValue, valueIndex) => {
          const oldTensor = oldParams[paramName][tensorIndex];
          if (oldTensor == null) {
            throw new Error(`old param not found!`);
          }
          const oldParamValue = oldTensor.data[valueIndex];
          deltas[`currentParams.${paramName}.${tensorIndex}.data.${valueIndex}`] = newParamValue - oldParamValue;
        });
      });
    });
    return deltas;
  }

  storeParameters(oldParams: ?Params, newParams: Params) {    
    const collection = this.db.collection('parameters');
    return new Promise((resolve, reject) => {
      const next = (err: mixed, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
      if (oldParams != null) {
        log('storing param deltas');
        const deltas = this.computeDeltas(oldParams, newParams);
        collection.update({}, { $inc: deltas }, {}, next);
      } else {
        log('storing params (not deltas)');
        collection.insert({ currentParams: newParams }, next);
      }
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

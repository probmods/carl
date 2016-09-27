'use strict'; // @flow

import fs from 'fs'
import path from 'path';

import http from '../common/http';
import settings from '../common/settings';
import webppl from '../common/webppl';
import { log, error, httpSuccess, httpFailure } from './util';


class Inferer {

  compiled: mixed
  storeURL: string

  constructor(options) {
    const code = this.loadModelCode();
    this.compiled = webppl.compileCode(code);    
    this.storeURL = `http://${settings.addresses.store.hostname}:${settings.addresses.store.port}`;
    this.registerObservationHandler();    
  }
  
  loadModelCode(): string {
    const commonCode = fs.readFileSync(path.join(settings.appDirectory, 'common.wppl'), 'utf-8');
    const infererCode = fs.readFileSync(path.join(settings.appDirectory, 'infer.wppl'), 'utf-8');
    return `${commonCode}\n${infererCode}`;
  }  

  registerObservationHandler() {
    const data = {
      callbackURL: (`http://${settings.addresses.infer.hostname}:` +
                    `${settings.addresses.infer.port}/handleObservation`),
      collection: 'observations'
    };
    http.sendPOSTRequest(`${this.storeURL}/registerHandler`, data, (err, result, body) => {
      if (!err && result && result.statusCode === 200) {
        log('successfully registered observation handler');
      } else {
        error(`failed to register observation handler, will try again`);
        setTimeout(this.registerObservationHandler, 2000);
      }
    });
  }

  handleObservation(request: RequestWithBody, reponse: Response): ?Response {
    log(`received observation: ${JSON.stringify(request.body)}`);
  }

  run() {
  }

}


function serve() {

  const hostname = settings.addresses.infer.hostname;
  const port = settings.addresses.infer.port;

  const inferer = new Inferer();
  inferer.run();

  http.runServer(
    { post: { handleObservation: inferer.handleObservation }, port },
    () => { log(`running at http://${hostname}:${port}`); });

}


if ((require: any).main === module) {
  serve();
}

export default {
  serve
};

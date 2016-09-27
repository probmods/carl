'use strict'; // @flow

import _ from 'lodash';
import bodyParser from 'body-parser';
import express from 'express';
import { post as _sendPOSTRequest } from 'request';

import type { Logger } from '../common/util';


type ServerOptions = {
  get?: { [key: string]: (request: Request, response: Response) => ?Response },
  post?: { [key: string]: (request: RequestWithBody, response: Response) => ?Response },
  port: number
};


function checkRequestFields<T>(request: Request, requiredFields: [string], failure: (message: string) => T, success: () => T): T {
  if (requiredFields.length === 0) {
    return success();
  }
  if (!request.body || !(request.body instanceof Object)) {
    return failure('POST request body not found');
  }
  for (var i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (request.body[field] === undefined) {
      return failure(`required field '${field}' not found`);
    }
  }
  return success();  
}

function makeTextResponder(statusCode: number, logger: Logger) {
  return (response: Response, text: string): Response => {
    logger(text);
    // $FlowIssue: method `status` cannot be called on number?    
    return response.status(statusCode).send(text);
  };
}

function runServer(options: ServerOptions, callback: () => void) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  _.mapValues(options.get, (value, key) => {
    app.get(`/${key}`, value);
  });  
  _.mapValues(options.post, (value, key) => {
    app.post(`/${key}`, value);
  });
  app.listen(options.port, callback); 
}

function sendPOSTRequest<T>(url: string, data: Object, callback: (error: string, result: ?Object, body: mixed) => T) {
  return _sendPOSTRequest(url, { json: data }, callback);
}

export default {
  checkRequestFields,
  makeTextResponder,
  runServer,
  sendPOSTRequest
};

'use strict'; // @flow

import _ from 'lodash';
import bodyParser from 'body-parser';
import express from 'express';

import type { Logger } from '../common/util';


type ServerOptions = {
  get?: { [key: string]: (request: Request, response: Response) => Response },
  post?: { [key: string]: (request: RequestWithBody, response: Response) => Response },
  port: number
};


function checkPOSTRequestHasFields<T>(request: Request, requiredFields: [string], success: () => T, failure: (message: string) => T): T {
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


export default {
  checkPOSTRequestHasFields,
  makeTextResponder,
  runServer  
};

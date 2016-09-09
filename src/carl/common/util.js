'use strict'; // @flow

const _ = require('lodash');
const colors = require('colors/safe');
const bodyParser = require('body-parser');
const express = require('express');


type ServerOptions = {
  get?: { [key: string]: (request: Request, response: Response) => Response },
  post?: { [key: string]: (request: Request, response: Response) => Response },
  port: number
};

type Logger = (text: string) => void;


function makeLogger(options: Object): Logger {
  const prefix = options.prefix || 'misc';
  const prefixColor = options.prefixColor || 'white';
  const textColor = options.textColor || 'white';
  return (text: string) => {
    const bracketedPrefix = `[${prefix}]`;
    console.log(`${colors[prefixColor](bracketedPrefix)} ${colors[textColor](text)}`);
  };
}

function makeHTTPResponder(statusCode: number, logger: Logger) {
  return (response: Response, text: string): Response => {
    logger(text);
    // return response.status(statusCode).send(text);
    return response;
  };
}

function runServer(options: ServerOptions, callback: () => void) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  _.mapValues(options.get, (value, key) => {
    app.get(key, value);
  });  
  _.mapValues(options.post, (value, key) => {
    app.post(key, value);
  });
  app.listen(options.port, callback); 
}


const log = makeLogger({ prefix: 'util', prefixColor: 'gray' });


module.exports = {
  makeLogger,
  makeHTTPResponder,
  runServer
};

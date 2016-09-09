'use strict'; // @flow

const _ = require('lodash');
const colors = require('colors/safe');
const bodyParser = require('body-parser');
const express = require('express');


function makeLogger(options: Object): (() => void) {
  const prefix = options.prefix || 'misc';
  const prefixColor = options.prefixColor || 'white';
  const textColor = options.textColor || 'white';
  return (text) => {
    const bracketedPrefix = `[${prefix}]`;
    console.log(`${colors[prefixColor](bracketedPrefix)} ${colors[textColor](text)}`);
  };
}

const log = makeLogger({ prefix: 'util', prefixColor: 'gray' });

function hi(x: string): void {
  log(x);
}

type ServerOptions = {
  get?: { [key: string]: () => void },
  post?: { [key: string]: () => void },
  port: number
};

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


module.exports = {
  hi,
  makeLogger,
  runServer
};

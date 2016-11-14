'use strict'; // @flow

import colors from 'colors/safe';
import { generate } from 'project-name-generator';


export type Logger = (text: string) => void;

function makeLogger(options: Object): Logger {
  const prefix = options.prefix || 'misc';
  const prefixColor = options.prefixColor || 'white';
  const textColor = options.textColor || 'white';
  return (text: string) => {
    const bracketedPrefix = `[${prefix}]`;
    console.log(`${colors[prefixColor](bracketedPrefix)} ${colors[textColor](text)}`);
  };
}

function randomName() {
  return generate().dashed;
}


export default {
  makeLogger,
  randomName
};

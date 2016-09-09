'use strict';
// @flow

const colors = require('colors/safe');


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


module.exports = {
  hi: hi,
  makeLogger: makeLogger
};

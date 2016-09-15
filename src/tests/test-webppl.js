'use strict'; // @flow

import assert from 'assert';
import path from 'path';
import webppl from '../carl/common/webppl';


function main() {
  const compile = (filename: string) => {
    const filepath = path.join(__dirname, filename);
    return webppl.compile(filepath);    
  };
  webppl.run(compile('test-success.wppl'), {}, (error: ?string, value: mixed) => {
    assert.strictEqual(error, null);
    assert.notStrictEqual(value, null);
    console.log(`value: ${JSON.stringify(value)}`);
  });
  webppl.run(compile('test-error.wppl'), {}, (error: ?string, value: mixed) => {
    assert.notStrictEqual(error, null);
    assert.strictEqual(value, null);
    console.log(`error (expected): ${JSON.stringify(error)}`);
  });  
}

main();

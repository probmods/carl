'use strict'; // @flow

import assert from 'assert';
import path from 'path';
import webppl from '../carl/common/webppl';


function test() {
  const compile = (filename: string) => {
    const filepath = path.join(__dirname, filename);
    return webppl.compile(filepath);    
  };

  // basic webppl program without error
  webppl.run(compile('test-success.wppl'), {}, (error: ?string, value: mixed) => {
    assert.strictEqual(error, null);
    assert.notStrictEqual(value, null);
    // console.log(`value: ${JSON.stringify(value)}`);
  });

  // basic webppl program with error
  webppl.run(compile('test-error.wppl'), {}, (error: ?string, value: mixed) => {
    assert.notStrictEqual(error, null);
    assert.strictEqual(value, null);
    // console.log(`error (expected): ${JSON.stringify(error)}`);
  });
  
  // parameter optimization without previous parameters
  var params: any = undefined;
  webppl.run(compile('test-params.wppl'), { initialStore: { params: params } }, (error: ?string, value: any) => {
    assert.strictEqual(error, null);
    assert.notStrictEqual(value, null);
    var p_ = value.p_[0].data[0];
    assert.ok(p_ > 0);
    params = value;
  });

  // parameter optimization with previous parameters; check that we optimize some more
  webppl.run(compile('test-params.wppl'), { initialStore: { params: params } }, (error: ?string, value: any) => {
    assert.strictEqual(error, null);
    assert.notStrictEqual(value, null);
    var p_old = params.p_[0].data[0];
    var p_new = value.p_[0].data[0];
    assert.ok(p_new > p_old);
  });
  
}


if ((require: any).main === module) {
  test();
}

export default {
  test
};

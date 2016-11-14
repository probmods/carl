'use strict'; // @flow

// This is a wrapper that makes webppl easier to use from nodejs.

import fs from 'fs';
import path from 'path';
import webppl from 'webppl';


function requireExtraHeader(): void {
  const headerPath = path.join(__dirname, 'webppl-header.js');
  webppl.requireHeader(headerPath);
}

function compileFile(path: string): Compiled {
  const code = fs.readFileSync(path, 'utf8');
  return compileCode(code);
}

function compileCode(code: string): Compiled {
  const compiled = webppl.compile(code, {
    verbose: true,
    debug: true
  });
  requireExtraHeader();
  return compiled;
}

function run(compiled: mixed, options: Object, callback: (error: ?string, value: any) => any): void {
  try {
    const prepared = webppl.prepare(
      compiled,
      (s, value) => {
        callback(null, value)
      },
      options  // may include `initialStore`
    );
    prepared.run();
  } catch (e) {
    callback(e, null);
  }    
}


export default {
  compileFile,
  compileCode,
  run,
  compile: compileCode,  
}

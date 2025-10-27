/* eslint-disable no-unused-vars */
import { Bench } from "tinybench";

import { compile, multiReExecutor } from "./index.js";

const patterns = [
  /http:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\/[a-zA-Z0-9/?=&%.-_]*/g,
  /https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\/[a-zA-Z0-9/?=&%.-_]*/g,
  /ftp:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\/[a-zA-Z0-9/?=&%.-_]*/g,
  /\d{4}-\d{2}-\d{2}/g,
  /magnet:\?xt=urn:[a-zA-Z0-9:]+&dn=[a-zA-Z0-9%20.-_]*/g,
];

const testString = `Here are some links:
http://example.com/path?query=123
https://secure.example.com/login
ftp://files.example.com/downloads/file.zip
The date is 2024-06-15.
Here is a magnet link: magnet:?xt=urn:btih:abcdef1234567890&dn=example file
`.repeat(10);

const bench = new Bench();

{
  const [rx, infos] = compile(patterns.map(pat => pat.source), "g");
  bench.add("compile", () => {
    let match;
    while ((match = rx.exec(testString)) !== null) {
      // do nothing
    }
  });

  bench.add("compile, find pattern index", () => {
    let match;
    // rx.lastIndex = 0;
    while ((match = rx.exec(testString)) !== null) {
      // find which pattern matched
      let patternIndex = -1;
      for (let i = 0; i < infos.length; i++) {
        const info = infos[i];
        if (match[info.offset] !== undefined) {
          patternIndex = i;
          break;
        }
      }
    }
  });

  const rx2 = multiReExecutor([rx]);
  bench.add("multiReExecutor overhead", () => {
    let match;
    while ((match = rx2.exec(testString)) !== null) {
      // do nothing
    }
  });
}

{
  const [rx, infos] = compile(patterns.map(pat => pat.source), { captureAll: false, flags: "g" });

  bench.add("compile, no captureAll", () => {
    let match;
    while ((match = rx.exec(testString)) !== null) {
      // do nothing
    }
  });
}

{
  const rx = multiReExecutor(patterns);
  bench.add("multiReExecutor", () => {
    let match;
    // rx.lastIndex = 0;
    while ((match = rx.exec(testString)) !== null) {
      // do nothing
    }
  });
}

bench.run().then(results => {
  console.table(bench.table());
});

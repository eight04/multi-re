multi-re
========

[![test](https://github.com/eight04/multi-re/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/multi-re/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/eight04/multi-re/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/multi-re)

Compile multiple regex into one. Match text with multiple patterns efficiently.

Installation
------------

```
npm install multi-re
```

Usage
-----

```JavaScript
import {compile, evalRepl} from "multi-re";

const [rx, groupInfos] = compile([
  /foo(\d+)/,
  /bar(\d+)/,
  /baz(\d+)/
].map(r => r.source), "g");

const s = "test foo123 bar456 baz789 foo000";

let match;
while ((match = rx.exec(s)) !== null) {
  const matchedPatternIndex = groupInfos.findIndex(
    info => match[info.offset] !== undefined
  );

  console.log(`Matched pattern #${matchedPatternIndex}:`);
  console.log(match[0]);
  console.log(match[groupInfos[matchedPatternIndex].offset + 1]);

  // evalRepl is a helper function to evaluate replacement patterns
  const replacement = evalRepl("$1_replaced", match, groupInfos[matchedPatternIndex]);
  console.log(`Replacement: ${replacement}`);
}
```

API references
--------------

Check the [.d.ts file](./types/index.d.ts) for TypeScript type definitions.

Benchmark
---------
`npm run bench`:

```
┌─────────┬───────────────────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                     │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼───────────────────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'compile'                     │ '9830.9 ± 0.74%' │ '8300.0 ± 100.00' │ '114018 ± 0.10%'       │ '120482 ± 1469'        │ 101720  │
│ 1       │ 'compile, find pattern index' │ '10078 ± 0.63%'  │ '8900.0 ± 200.00' │ '107647 ± 0.09%'       │ '112360 ± 2583'        │ 99226   │
│ 2       │ 'compile, no captureAll'      │ '9419.1 ± 0.60%' │ '8300.0 ± 100.00' │ '114941 ± 0.09%'       │ '120482 ± 1469'        │ 106167  │
│ 3       │ 'multiReExecutor'             │ '16746 ± 0.80%'  │ '14500 ± 200.00'  │ '64070 ± 0.13%'        │ '68966 ± 938'          │ 59715   │
└─────────┴───────────────────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘
```

Changelog
---------

* 0.2.0 (Oct 27, 2025)

  - Change: the signature of `compile` is changed.
  - Add: `prefix`, `suffix` options to `compile`.

* 0.1.2 (Oct 27, 2025)

  - Fix: pacakaging issue.

* 0.1.1 (Oct 27, 2025)

  - Fix: back reference bug.

* 0.1.0 (Oct 27, 2025)

  - First release

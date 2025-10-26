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
const {MultiRegExp} = require("multi-re");

const rx = new MultiRegExp([
  /foo/,
  /bar/,
  /baz/
]);
for (let match; (match = rx.exec("foobarbaz")) !== null; ) {
  console.log(`Matched pattern #${match.index}: ${match[0]}`);
}
```

API references
--------------

Check the [.d.ts file](./index.d.ts) for TypeScript type definitions.

Performance
-----------

TBD. Compare the performance of `MultiRegExp` with running multiple regex separately.

Changelog
---------

* 0.1.0 

  - First release

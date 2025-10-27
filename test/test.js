import test from "node:test";
import assert from "node:assert/strict";

import {compile, multiReExecutor, evalRepl} from "../index.js";

test("compile", () => {
  const [rx, gs] = compile([
    /foo(\d+)/,
    /(\d+)/
  ].map(r => r.source), "g");

  const s = "test foo123 test bar456 test";
  let match = rx.exec(s);
  assert.equal(match[0], "foo123");
  assert.equal(match[gs[0].offset + 1], "123");
  assert.equal(match.index, 5);
  assert.equal(rx.lastIndex, 11);

  match = rx.exec(s);
  assert.equal(match[0], "456");
  assert.equal(match[gs[1].offset + 1], "456");
  assert.equal(match.index, 20);
  assert.equal(rx.lastIndex, 23);
});
	
test("multiReExecutor", () => {
  const rxs = [
    /foo(\d+)/g,
    /(\d+)/g
  ];
  const rx = multiReExecutor(rxs);

  const s = "test foo123 test bar456 test";
  let match = rx.exec(s);
  assert.equal(match[0], "foo123");
  assert.equal(match[1], "123");
  assert.equal(match.index, 5);
  assert.equal(rx.lastIndex, 11);
  assert.equal(rx.lastRx, rxs[0]);

  match = rx.exec(s);
  assert.equal(match[0], "456");
  assert.equal(match[1], "456");
  assert.equal(match.index, 20);
  assert.equal(rx.lastIndex, 23);
  assert.equal(rx.lastRx, rxs[1]);
});
  
test("evalRepl", () => {
  const rxs = [
    /foo(\d+)/g,
    /bar(\d+)/g
  ];
  const repls = [
    (match, g1) => `FOO[${g1}]`,
    "BAR[$1]"
  ];
  const [rx, gs] = compile(rxs.map(r => r.source), "g");

  const s = "test foo123 test bar456 test";
  let match = rx.exec(s);
  let i = gs.findIndex(g => match[g.offset] !== undefined);
  assert.equal(evalRepl(repls[i], match, gs[i]), "FOO[123]");
  
  match = rx.exec(s);
  i = gs.findIndex(g => match[g.offset] !== undefined);
  assert.equal(evalRepl(repls[i], match, gs[i]), "BAR[456]");
});


import test from "node:test";
import assert from "node:assert/strict";

import {MultiRegExp} from "../index.js";

test("match multiple regexp", () => {
  const rx = new MultiRegExp([
    { pattern: /foo(\d+)/.source },
    { pattern: /bar(\d+)/.source }
  ], "g");
  
  const s = "test foo123 test bar456 test"
  let match = rx.exec(s);
  assert.equal(match[0], "foo123");
  assert.equal(match[1], "123");
  assert.equal(match.patternIndex, 0);
  assert.equal(match.index, 5);
  assert.equal(rx.lastIndex, 11);

  match = rx.exec(s);
  assert.equal(match[0], "bar456");
  assert.equal(match[1], "456");
  assert.equal(match.patternIndex, 1);
  assert.equal(match.index, 17);
  assert.equal(rx.lastIndex, 23);
});
	
test("overlap: true", {skip: true}, () => {
  const rx = new MultiRegExp([
    { pattern: /foo(\d+)/.source },
    { pattern: /(\d+)/.source }
  ], {overlap: true});

  const s = "test foo123 test bar456 test";
  let match = rx.exec(s);
  assert.equal(match.patternIndex, 0);
  assert.equal(match[0], "foo123");
  assert.equal(match[1], "123");
  assert.equal(match.index, 5);
  assert.equal(rx.lastIndex, 1);

  match = rx.exec(s);
  assert.equal(match.patternIndex, 1);
  assert.equal(match[0], "123");
  assert.equal(match.index, 8);
  assert.equal(rx.lastIndex, 9); // FIXME: shouldn't overlap with itself?
});
	
test("replace", () => {
  const rx = new MultiRegExp([
    {
      pattern: /foo(\d+)/.source,
      replace: (match) => `FOO[${match[1]}]`
    },
    {
      pattern: /bar(\d+)/.source,
      replace: "BAR[$1]"
    }
  ], "g");

  const s = "test foo123 test bar456 test";
  let match = rx.exec(s);
  assert.equal(match.replace(), "FOO[123]");
  
  match = rx.exec(s);
  assert.equal(match.replace(), "BAR[456]");
});


/**
 * Evaluate the replacement string/function with the given match and group info.
 *
 * @param {string|Function} repl - The replacement string or function.
 * @param {RegExpMatchArray} match - The match array.
 * @param {{offset: number, length?: number}} groupInfo - Information about the capturing groups. If repl is a string, length is optional.
 * @returns {string} The result.
 */
export function evalRepl(repl, match, groupInfo) {
  if (typeof repl === 'function') {
    return repl(match[0], ...match.slice(groupInfo.offset + 1, groupInfo.offset + 1 + groupInfo.length));
  }
  return repl.replace(/\$([0-9]+|&)/g, (_, g1) => {
    if (g1 === '&') {
      return match[0];
    }
    const index = Number(g1);
    return match[groupInfo.offset + index] || '';
  });
}

/**
 * @typedef {object} GroupInfo
 * @property {string[]} names - The names of the capturing groups.
 * @property {number} length - The number of capturing groups.
 * @property {number} offset - The offset of the group indexes in the combined RegExp. Use `match[info.offset + n]` to access the nth capturing group of the pattern. When `captureAll` is true, `match[info.offset + 0]` is the extra capturing group added to detect which pattern matched.
 */

/**
 * @typedef {object} CompileOptions
 * @property {string} [flags] - The flags for the RegExp.
 * @property {boolean} [captureAll] - If true (default), add capture group to each pattern to detect which pattern matched.
 * @property {string} [prefix] - Prefix the entire regex. This shouldn't contain capturing groups.
 * @property {string} [suffix] - Suffix the entire regex. This shouldn't contain capturing groups.
 */

/**
 * Compiles multiple patterns into a single RegExp.
 *
 * @param {Array<string>} patterns - An array of regex pattern strings.
 * @param {string|CompileOptions} [flagsOrOptions] - Optional flags for the RegExp.
 * @param {boolean} [captureAll] - If true (default), add capture group to each pattern to detect which pattern matched.
 * @returns {[RegExp, groupInfos: GroupInfo[]]} A RegExp that matches any of the provided patterns. groupInfos contains information about the capturing groups of each pattern.
 */
export function compile(patterns, flagsOrOptions) {
  let options;
  if (typeof flagsOrOptions === 'string' || flagsOrOptions === undefined) {
    options = {flags: options || '', captureAll: true};
  } else {
    options = flagsOrOptions;
  }
  if (options.captureAll === undefined) {
    options.captureAll = true;
  }
  const infos = patterns.map(p => analyzeRe(p));
  infos[0].offset = options.captureAll ? 1 : 0;
  for (let i = 1; i < infos.length; i++) {
    infos[i].offset = infos[i - 1].offset + infos[i - 1].length + (options.captureAll ? 1 : 0);
  }
  for (let i = 0; i < patterns.length; i++) {
    // rewrite backreferences in pattern
    patterns[i] = patterns[i].replace(/\\(\d+)/g, (match, g1) => {
      const originalIndex = Number(g1);
      const newIndex = originalIndex + infos[i].offset;
      return `\\${newIndex}`;
    });
  }
  let pattern = patterns.map((pat) => {
    if (options.captureAll) {
      return `(${pat})`;
    }
    return pat;
  }).join('|');
  if (options.prefix || options.suffix) {
    pattern = `${options.prefix || ''}(?:${pattern})${options.suffix || ''}`;
  }
  const rx = new RegExp(pattern, options.flags);
  return [rx, infos];
}

function analyzeRe(source) {
  const re = new RegExp(source + '|');
  const match = re.exec('');
  return {
    names: re.groups ? Object.keys(re.groups) : [],
    length: match.length - 1,
    offset: 0,
  };
}

/**
 * Creates a multi RegExp executor that can execute multiple regexps on the same string then return the earliest match.
 *
 * The matching speed is slower than combining the regexps into one when the string is very long. On the other hand, it can be faster when the string is short and there are many regexps to match so searching patternIndex is slow in compiled regex.
 *
 * @param {RegExp[]} rxs - An array of RegExp objects. They should have the 'g' flag set.
 * @returns {{exec: function(string): RegExpMatchArray|null, lastRx: RegExp, lastIndex: number}} An object with an exec method.
 */
export function multiReExecutor(rxs) {
  const cases = rxs.map(rx => ({rx, done: false, match: null}));
  const self = {exec, lastRx: null, lastIndex: 0};
  return self;

  function exec(s) {
    let match = null;
    for (const c of cases) {
      if (c.done) {
        continue;
      }
      if (c.match && c.match.index < self.lastIndex || !c.match) {
        // the cached match is before lastIndex, skip it
        c.rx.lastIndex = self.lastIndex;
        c.match = c.rx.exec(s);
      }
      if (!c.match) {
        c.done = true;
        continue;
      }
      if (!match || c.match.index < match.index) {
        match = c.match;
        self.lastRx = c.rx;
      }
    }
    if (match) {
      self.lastIndex = match.index + match[0].length;
      return match;
    }
    self.lastIndex = 0;
    for (const c of cases) {
      c.done = false;
    }
    return null;
  }
}

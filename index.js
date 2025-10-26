/**
 * @typedef {function(MultiRegExpMatch): string} Replacer
 *
 * @typedef {object} Pattern
 * @property {string} pattern - The string pattern to match.
 * @property {string|Replacer} [replace] - Optional replacement string.
 *
 * @typedef {object} PatternInfo
 * @property {Array<string>} groupNames - The names of the capturing groups.
 * @property {number} groupCount - The number of capturing groups.
 * @property {number} startingGroup - The starting index of the capturing groups in the combined pattern.
 */

/**
 * Creates a MultiRegExpMatch instance. You should not call this constructor directly.
 */
export class MultiRegExpMatch extends Array {
  /**
   * @param {RegExpExecArray} match - The match array from RegExp.exec().
   * @param {object} options
   * @param {number} options.patternIndex - The index of the matched pattern.
   * @param {Pattern} options.pattern - The pattern object that matched.
   * @param {PatternInfo} options.info - Information about the pattern's groups.
   */
  constructor(match, { patternIndex, pattern, info }) {
    super(info.groupCount + 1);
    this.patternIndex = patternIndex;
    this.pattern = pattern;
    this.info = info;
    this[0] = match[0];
    // FIXME: can we slice a match?
    for (let i = 0; i < info.groupCount; i++) {
      this[1 + i] = match[1 + i + 1 + info.startingGroup];
    }
    this.index = match.index;
    this.input = match.input;
    this.groups = undefined;
    if (info.groupNames.length > 0) {
      this.groups = {};
      for (const name of info.groupNames) {
        this.groups[name] = match.groups[name];
      }
    }
    if (match.indices) {
      this.indices = [
        match.indices[0],
        ...match.indices.slice(1 + info.startingGroup, 1 + info.startingGroup + info.groupCount)
      ];
      if (info.groupNames.length > 0) {
        this.indices.groups = {};
        for (const name of info.groupNames) {
          this.indices.groups[name] = match.indices.groups[name];
        }
      }
    }
  }
  replace() {
    if (this.pattern.replace === undefined) {
      return this[0];
    }
    if (typeof this.pattern.replace === 'string') {
      // FIXME: would this work?
      // return this[0].replace(new RegExp(this.pattern.pattern, 'g'), this.pattern.replace);
      return this.pattern.replace.replace(/\$([0-9]+|&)/g, (match, g1) => {
        if (g1 === '&') {
          return this[0];
        }
        const index = Number(g1);
        return this[index] !== undefined ? this[index] : '';
      });
    }
    if (typeof this.pattern.replace === 'function') {
      return this.pattern.replace(this);
    }
    throw new Error('MultiRegExpMatch replace: invalid replace type');
  }
}

export class MultiRegExp extends RegExp {
  /**
   * Creates a MultiRegExp that matches any of the provided patterns.
   * @param {Array<Pattern>} patterns - An array of string patterns to combine.
   * @param {string} [flags] - Optional flags for the RegExp.
   */
  constructor(patterns, flags) {
    const infos = patterns.map(p => analyzeRe(p.pattern));
    infos[0].startingGroup = 0;
    for (let i = 1; i < infos.length; i++) {
      infos[i].startingGroup = infos[i - 1].startingGroup + infos[i - 1].groupCount + 1; // we will wrap each pattern in an extra group
    }
    for (let i = 0; i < patterns.length; i++) {
      // rewrite backreferences in pattern
      patterns[i].pattern = patterns[i].pattern.replace(/\\(\d+)/g, (match, g1) => {
        const originalIndex = Number(g1);
        const newIndex = originalIndex + infos[i].startingGroup + 1;
        return `\\${newIndex}`;
      });
    }
    super(patterns.map(pat => `(${pat.pattern})`).join('|'), flags);
    this.patterns = patterns;
    this.infos = infos;
  }
  exec(str) {
    const match = super.exec(str);
    if (match === null) {
      return null;
    }
    // find which pattern matched
    let patternIndex = -1;
    for (let i = 0; i < this.infos.length; i++) {
      if (match[this.infos[i].startingGroup + 1] !== undefined) {
        patternIndex = i;
        break;
      }
    }
    if (patternIndex === -1) {
      throw new Error('MultiRegExp exec: matched but could not find matching pattern');
    }
    return new MultiRegExpMatch(match, {
      patternIndex,
      pattern: this.patterns[patternIndex],
      info: this.infos[patternIndex],
    });
  }
}

/**
 * Analyzes a regular expression pattern string to determine its capturing groups.
 * @param {string} source - The regular expression pattern string.
 * @returns {PatternInfo} Information about the pattern's capturing groups.
 */
function analyzeRe(source) {
  const re = new RegExp(source + '|');
  const match = re.exec('');
  return {
    groupNames: re.groups ? Object.keys(re.groups) : [],
    groupCount: match.length - 1,
    startingGroup: 0,
  };
}

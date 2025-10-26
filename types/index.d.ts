declare module 'multi-re' {
	/**
	 * Creates a MultiRegExpMatch instance. You should not call this constructor directly.
	 */
	export class MultiRegExpMatch extends Array<any> {
		/**
		 * @param match - The match array from RegExp.exec().
		 * */
		constructor(match: RegExpExecArray, { patternIndex, pattern, info }: {
			patternIndex: number;
			pattern: Pattern;
			info: PatternInfo;
		});
		patternIndex: number;
		pattern: Pattern;
		info: PatternInfo;
		0: string;
		index: number;
		input: string;
		groups: {};
		indices: [number, number][];
		replace(): string;
	}
	export class MultiRegExp extends RegExp {
		/**
		 * Creates a MultiRegExp that matches any of the provided patterns.
		 * @param patterns - An array of string patterns to combine.
		 * @param flags - Optional flags for the RegExp.
		 */
		constructor(patterns: Array<Pattern>, flags?: string);
		patterns: Pattern[];
		infos: PatternInfo[];
		exec(str: any): MultiRegExpMatch;
	}
	export type Replacer = (arg0: MultiRegExpMatch) => string;
	export type Pattern = {
		/**
		 * - The string pattern to match.
		 */
		pattern: string;
		/**
		 * - Optional replacement string.
		 */
		replace?: string | Replacer;
	};
	export type PatternInfo = {
		/**
		 * - The names of the capturing groups.
		 */
		groupNames: Array<string>;
		/**
		 * - The number of capturing groups.
		 */
		groupCount: number;
		/**
		 * - The starting index of the capturing groups in the combined pattern.
		 */
		startingGroup: number;
	};

	export {};
}

//# sourceMappingURL=index.d.ts.map
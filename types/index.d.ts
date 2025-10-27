declare module 'multi-re' {
	/**
	 * Evaluate the replacement string/function with the given match and group info.
	 *
	 * @param repl - The replacement string or function.
	 * @param match - The match array.
	 * @param groupInfo - Information about the capturing groups. If repl is a string, length is optional.
	 * @returns The result.
	 */
	export function evalRepl(repl: string | Function, match: RegExpMatchArray, groupInfo: {
		offset: number;
		length?: number;
	}): string;

	/**
	 * Compiles multiple patterns into a single RegExp.
	 *
	 * @param patterns - An array of regex pattern strings.
	 * @param flags - Optional flags for the RegExp.
	 * @param captureAll - If true (default), add capture group to each pattern to detect which pattern matched.
	 * @returns A RegExp that matches any of the provided patterns. groupInfos contains information about the capturing groups of each pattern.
	 */
	export function compile(patterns: Array<string>, flags?: string, captureAll?: boolean): [RegExp, groupInfos: GroupInfo[]];
	/**
	 * Creates a multi RegExp executor that can execute multiple regexps on the same string then return the earliest match.
	 *
	 * The matching speed is slower than combining the regexps into one when the string is very long. On the other hand, it can be faster when the string is short and there are many regexps to match so searching patternIndex is slow in compiled regex.
	 *
	 * @param rxs - An array of RegExp objects. They should have the 'g' flag set.
	 * @returns An object with an exec method.
	 */
	export function multiReExecutor(rxs: RegExp[]): {
		exec: (arg0: string) => RegExpMatchArray | null;
		lastRx: RegExp;
		lastIndex: number;
	};
	export type GroupInfo = {
		/**
		 * - The names of the capturing groups.
		 */
		names: string[];
		/**
		 * - The number of capturing groups.
		 */
		length: number;
		/**
		 * - The offset of the group indexes in the combined RegExp. Use `match[info.offset + n]` to access the nth capturing group of the pattern. When `captureAll` is true, `match[info.offset + 0]` is the extra capturing group added to detect which pattern matched.
		 */
		offset: number;
	};

	export {};
}

//# sourceMappingURL=index.d.ts.map
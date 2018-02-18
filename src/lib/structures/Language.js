const { pathExists } = require('fs-nextra');
const { join } = require('path');
const Piece = require('./base/Piece');
const { mergeDefault, isClass } = require('../util/util');

/**
 * Base class for all Klasa Languages. See {@tutorial CreatingLanguages} for more information how to use this class
 * to build custom languages.
 * @tutorial CreatingLanguages
 * @extends Piece
 */
class Language extends Piece {

	/**
	 * @typedef {Object} LanguageOptions
	 * @property {string} [name=theFileName] The name of the language
	 * @property {boolean} [enabled=true] Whether the language is enabled or not
	 * @memberof Language
	 */

	/**
	 * @since 0.2.1
	 * @param {KlasaClient} client The Klasa Client
	 * @param {Array} file The path from the pieces folder to the finalizer file
	 * @param {boolean} core If the piece is in the core directory or not
	 * @param {LanguageOptions} [options={}] Optional Language settings
	 */
	constructor(client, file, core, options = {}) {
		options = mergeDefault(client.options.pieceDefaults.languages, options);
		super(client, 'language', file, core, options);
	}

	/**
	 * The method to get language strings
	 * @since 0.2.1
	 * @param {string} term The string or function to look up
	 * @param {...*} args Any arguments to pass to the lookup
	 * @returns {string|Function}
	 */
	get(term, ...args) {
		if (!this.enabled && this !== this.client.languages.default) return this.client.languages.default.get(term, ...args);
		/* eslint-disable new-cap */
		if (!this.language[term]) {
			if (this === this.client.languages.default) return this.language.DEFAULT(term);
			return [
				`${this.language.DEFAULT(term)}`,
				'',
				`**${this.language.DEFAULT_LANGUAGE}:**`,
				`${(args.length > 0 ? this.client.languages.default.language[term](...args) : this.client.languages.default.language[term]) || this.client.languages.default.language.DEFAULT(term)}`
			].join('\n');
		}
		/* eslint-enable new-cap */
		return args.length > 0 ? this.language[term](...args) : this.language[term];
	}

	/**
	 * The init method to be optionally overwritten in actual languages
	 * @since 0.2.1
	 * @returns {void}
	 * @abstract
	 */
	async init() {
		const loc = join(this.client.coreBaseDir, 'languages', this.file);
		if (this.dir !== this.client.coreBaseDir && await pathExists(loc)) {
			try {
				const CorePiece = require(loc);
				if (!isClass(CorePiece)) return;
				const coreLang = new CorePiece(this.client, this.file, true);
				this.language = mergeDefault(coreLang.language, this.language);
			} catch (error) {
				return;
			}
		}
		return;
	}

}

module.exports = Language;
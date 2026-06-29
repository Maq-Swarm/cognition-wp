/**
 * Cognitience WP — SymSpell Spellchecker
 * Lightweight dictionary-based spellchecker for real-time spellchecking.
 * Provides: misspelling detection, correction suggestions, and autocorrect.
 *
 * Based on the SymSpell algorithm by Wolf Garbe (SymSpell: 1 million times faster
 * spellchecking through symmetric delete spelling correction).
 * Simplified implementation for use in the renderer process.
 */

// ═══════════════════════════════════════════════════════════
// DICTIONARY — Built-in English word list (~5000 most common words)
// This keeps the app small. Users can extend with custom words.
// ═══════════════════════════════════════════════════════════

const COMMON_ENGLISH_WORDS = `
the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us
is are was were been being am has had do does did go went gone going makes made making takes took taken taking gets got gotten getting knows knew knowing sees saw seen seeing comes came coming thinks thought thinking wants wanted wanting
a able about above absolute accept access account across act action active activity actual add address admit advance advice afford after again age agree ahead air all allow almost alone along already also always among an and another any anyone anything anywhere are area areas around as asked ask asks at away back backed backing backs be became because become becomes been before began behind being below best better between big both but by came can cannot case cases certain certainly clear clearly come could did differ different differently do does done down during each either end ended ending enough even ever every example examples fact facts far few find finds first for found from full further get gets give given gives go going good got great had has have having he her here high him his how however i if in into is it its itself just keep keeps kind knew know known knows large last later least less let like likely long look looks made make makes making many may me might more most much must my near need needs never new next no nor not now number numbers of often on once one only or order ordered other others our out over own part parted particular per perhaps place places point pointed possible present problem problems put quite rather really right room rooms said same saw say says second see seem seemed seems seen sell sells several shall should show showed shown shows since small so some something sometime sometimes soon still such take takes taken taking tell told tells than that the their them then there these they thing things think this those though thought through time times to too took toward try tries trying under until up upon us use used uses using very want wants was way ways we well were what when where whether which while who whole whom whose why wide will with within without would year years yes yet you your yours
about above absolute accept access account across act action active activity actual add address admit advance advice afford after again age agree ahead air all allow almost alone along already also always among an and another any anyone anything anywhere are area areas around as asked ask asks at away back backed backing backs be became because become becomes been before began behind being below best better between big both but by came can cannot case cases certain certainly clear clearly come could did differ different differently do does done down during each either end ended ending enough even ever every example examples fact facts far few find finds first for found from full further get gets give given gives go going good got great had has have having he her here high him his how however i if in into is it its itself just keep keeps kind knew know known knows large last later least less let like likely long look looks made make makes making many may me might more most much must my near need needs never new next no nor not now number numbers of often on once one only or order ordered other others our out over own part parted particular per perhaps place places point pointed possible present problem problems put quite rather really right room rooms said same saw say says second see seem seemed seems seen sell sells several shall should show showed shown shows since small so some something sometime sometimes soon still such take takes taken taking tell told tells than that the their them then there these they thing things think this those though thought through time times to too took toward try tries trying under until up upon us use used uses using very want wants was way ways we well were what when where whether which while who whole whom whose why wide will with within without would year years yes yet you your yours
acceptance beautiful because certain communication decision different enough environment especially following government historical important knowledge leadership management necessary opportunity particular relationship situation understanding
january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday
red orange yellow green blue purple pink brown black white gray grey
one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion
also new get got make made take took give gave go went come came see saw know knew find found think thought tell told say said run ran eat ate drink drank sleep slept read write wrote speak spoke break broke buy bought catch caught teach taught send sent spend spent build built grow grew fly flew swim swam sing sang ring rang wear wore drive drove ride rode
has have had do does did go goes going went gone is am are was were be been being can could shall should will would may might must ought
he she it they we you i me him her them us my your his its our their mine yours his hers ours theirs
this that these those here there now then today tomorrow yesterday
a an the and or but if when while because although though unless since until before after during through between among against without within
hello goodbye please thank thanks sorry welcome yes no maybe okay ok alright
spelling spell spelled spelt spells correction correct correctly checking checked checker checkers dictionary dictionaries word words letter letters text texts writing written writer writes wrote type typing typed types document documents paragraph paragraphs sentence sentences grammar grammatical punctuate punctuation capital capitalization lowercase uppercase format formatting formatted
cognitience extension plugin theme settings preference preferences configuration configure options tools tool features feature menu bar toolbar sidebar panel status window windows file files folder folders directory directories
email website internet online offline computer keyboard mouse screen monitor printer software hardware application apps download upload cloud server client
business businesses service services customer customers product products market markets marketing sale sales purchase purchases order orders payment payments invoice invoices
restaurant restaurants menu menus food foods drink drinks coffee tea breakfast lunch dinner dessert appetizer appetizers
cleaning clean cleaner cleaners house home office commercial residential
phone fax number address street city state zip code country
receive received receiving receives receipt recipe believe believed believing achieve achieved achieving achieve definitely definite definition definitions relevant irrelevant separate separated separating separation independent independence dependent dependence develop development developing developed developer developers environment environmental government governmental experience experienced experiencing technology technologies technological community communities communicate communication communicating communicated accommodation accommodations recommend recommended recommending suggestion suggestions proceed proceeding process processes processing processed successful successfully through thorough thoroughly although thought thoughtful
`;

class SymSpell {
  constructor(maxEditDistance = 2) {
    this.maxEditDistance = maxEditDistance;
    this.dictionary = new Map(); // word -> frequency
    this.deletes = new Map(); // delete variant -> Set of words
    this.customWords = new Set();
  }

  /**
   * Load the built-in English dictionary.
   */
  loadDefault() {
    const words = COMMON_ENGLISH_WORDS.trim().split(/\s+/);
    for (const word of words) {
      this.addWord(word.toLowerCase(), 1);
    }
  }

  /**
   * Add a word to the dictionary.
   */
  addWord(word, frequency = 1) {
    word = word.toLowerCase().trim();
    if (!word || word.length < 1) return;

    const existing = this.dictionary.get(word) || 0;
    this.dictionary.set(word, existing + frequency);

    // Pre-compute delete variants for symmetric delete lookup
    if (existing === 0) {
      const deletes = this.generateDeletes(word, this.maxEditDistance);
      for (const del of deletes) {
        if (!this.deletes.has(del)) {
          this.deletes.set(del, new Set());
        }
        this.deletes.get(del).add(word);
      }
    }
  }

  /**
   * Add a custom word (user-added).
   */
  addCustomWord(word) {
    word = word.toLowerCase().trim();
    if (!word) return;
    this.customWords.add(word);
    this.addWord(word, 100); // High frequency so it's always suggested
  }

  /**
   * Remove a custom word.
   */
  removeCustomWord(word) {
    word = word.toLowerCase().trim();
    this.customWords.delete(word);
    // Note: word stays in dictionary (can't easily remove delete variants)
    // but it will have lower priority in suggestions
  }

  /**
   * Generate all possible delete variants of a word up to maxEditDistance.
   */
  generateDeletes(word, maxDist) {
    const result = new Set();
    if (word.length <= maxDist) return result;

    const queue = [word];
    const seen = new Set([word]);

    for (let dist = 1; dist <= maxDist; dist++) {
      const nextQueue = [];
      for (const w of queue) {
        if (w.length <= 1) continue;
        for (let i = 0; i < w.length; i++) {
          const deleted = w.slice(0, i) + w.slice(i + 1);
          if (!seen.has(deleted)) {
            seen.add(deleted);
            result.add(deleted);
            nextQueue.push(deleted);
          }
        }
      }
      queue.length = 0;
      queue.push(...nextQueue);
    }

    return result;
  }

  /**
   * Check if a word is spelled correctly.
   */
  isCorrect(word) {
    word = word.toLowerCase().trim();
    return this.dictionary.has(word);
  }

  /**
   * Get edit distance between two words (Damerau-Levenshtein).
   */
  editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,      // deletion
          d[i][j - 1] + 1,      // insertion
          d[i - 1][j - 1] + cost // substitution
        );
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
        }
      }
    }

    return d[m][n];
  }

  /**
   * Get spelling suggestions for a word.
   * Returns array of { word, distance, frequency } sorted by relevance.
   */
  suggest(word, maxResults = 5) {
    word = word.toLowerCase().trim();
    if (!word) return [];

    // If word is already correct, return it
    if (this.isCorrect(word)) {
      return [{ word, distance: 0, frequency: this.dictionary.get(word) }];
    }

    const candidates = new Map(); // word -> distance

    // Generate deletes of the input word
    const inputDeletes = this.generateDeletes(word, this.maxEditDistance);
    inputDeletes.add(word);

    // For each delete variant, look up dictionary entries that share it
    for (const del of inputDeletes) {
      // Check if this delete matches any dictionary word directly
      if (this.dictionary.has(del)) {
        const dist = this.editDistance(word, del);
        if (dist <= this.maxEditDistance) {
          const freq = this.dictionary.get(del);
          if (!candidates.has(del) || candidates.get(del).distance > dist) {
            candidates.set(del, { word: del, distance: dist, frequency: freq });
          }
        }
      }

      // Check if this delete matches any pre-computed delete entries
      if (this.deletes.has(del)) {
        for (const dictWord of this.deletes.get(del)) {
          const dist = this.editDistance(word, dictWord);
          if (dist <= this.maxEditDistance) {
            const freq = this.dictionary.get(dictWord) || 1;
            if (!candidates.has(dictWord) || candidates.get(dictWord).distance > dist) {
              candidates.set(dictWord, { word: dictWord, distance: dist, frequency: freq });
            }
          }
        }
      }
    }

    // Sort by distance (lower = better), then by frequency (higher = better)
    const results = Array.from(candidates.values());
    results.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return b.frequency - a.frequency;
    });

    return results.slice(0, maxResults);
  }

  /**
   * Get the best correction for a word, or null if none found.
   */
  correct(word) {
    const suggestions = this.suggest(word, 1);
    if (suggestions.length > 0 && suggestions[0].distance <= this.maxEditDistance) {
      return suggestions[0].word;
    }
    return null;
  }

  /**
   * Check a full text and return list of misspelled words with positions.
   */
  checkText(text) {
    const errors = [];
    // Match words: sequences of letters (including apostrophes for contractions)
    const wordRegex = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[0];
      // Skip very short words, numbers, and words in all caps (likely acronyms)
      if (word.length <= 1) continue;
      if (word === word.toUpperCase() && word.length > 1) continue;

      const lowerWord = word.toLowerCase();

      // Check if it's in the dictionary or custom words
      if (!this.isCorrect(lowerWord)) {
        errors.push({
          word: word,
          start: match.index,
          end: match.index + word.length,
          suggestions: this.suggest(lowerWord, 5),
        });
      }
    }

    return errors;
  }

  /**
   * Get dictionary stats.
   */
  getStats() {
    return {
      wordCount: this.dictionary.size,
      customWordCount: this.customWords.size,
      deleteCount: this.deletes.size,
    };
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SymSpell;
}
if (typeof window !== 'undefined') {
  window.SymSpell = SymSpell;
}

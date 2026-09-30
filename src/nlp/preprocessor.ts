/**
 * Natural Language Processing Preprocessor
 * Implements tokenization, stopword elimination, morphological stemming,
 * homoglyph / leetspeak de-obfuscation, and n-gram extraction.
 */

// Standard curated English stopwords list for NLP classification
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Homoglyphs commonly abused to bypass keyword filters (Cyrillic, Greek lookalikes)
const HOMOGLYPH_MAP: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
  'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'і': 'i', 'ї': 'i', 'ј': 'j',
  'α': 'a', 'β': 'b', 'ο': 'o', 'ν': 'v', 'ρ': 'p',
};

// Leetspeak character map
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
};

// Zero-width characters regex
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF\u00AD\u2060]/g;

/**
 * Normalizes text, stripping zero-width stealth chars and normalizing homoglyphs
 */
export function normalizeText(rawText: string): { cleaned: string; detectedHomoglyphs: number; detectedZeroWidth: number } {
  const zeroWidthMatches = rawText.match(ZERO_WIDTH_REGEX);
  const detectedZeroWidth = zeroWidthMatches ? zeroWidthMatches.length : 0;
  let cleaned = rawText.replace(ZERO_WIDTH_REGEX, '');

  let detectedHomoglyphs = 0;
  let homoglyphCleaned = '';
  for (const char of cleaned) {
    if (HOMOGLYPH_MAP[char]) {
      homoglyphCleaned += HOMOGLYPH_MAP[char];
      detectedHomoglyphs++;
    } else {
      homoglyphCleaned += char;
    }
  }

  return {
    cleaned: homoglyphCleaned,
    detectedHomoglyphs,
    detectedZeroWidth,
  };
}

/**
 * Deobfuscates leetspeak patterns inside apparent words
 */
export function deobfuscateLeetspeak(word: string): string {
  // If word has symbols like @, $, 0, 1, 3 mixed with letters, normalize
  if (/[a-zA-Z]/.test(word) && /[@$0-9!|]/.test(word)) {
    let replaced = '';
    for (const ch of word) {
      replaced += LEET_MAP[ch] || ch;
    }
    return replaced;
  }
  return word;
}

/**
 * Basic morphological stemmer (Porter-style heuristic reduction)
 */
export function stemToken(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;

  // Suffix rules
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ies')) return w.slice(0, -2);
  if (w.endsWith('ss')) return w;
  if (w.endsWith('s')) return w.slice(0, -1);

  if (w.endsWith('eed')) {
    if (w.length > 5) return w.slice(0, -1);
    return w;
  }
  if (w.endsWith('ingly')) return w.slice(0, -5);
  if (w.endsWith('edly')) return w.slice(0, -4);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('tion') && w.length > 6) return w.slice(0, -3);
  if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ness') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ful') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);

  return w;
}

/**
 * Tokenize a document into words and meaningful punctuation marks
 */
export function tokenize(text: string): { tokens: string[]; rawTokens: string[] } {
  // Extract word tokens, email-like tokens, currency amounts, and isolated symbols
  const regex = /[a-zA-Z0-9_\-\$€£%@\.]+|[!?,:;]/g;
  const matches = text.match(regex) || [];

  const rawTokens: string[] = [];
  const tokens: string[] = [];

  for (const match of matches) {
    rawTokens.push(match);
    // Remove edge punctuation from word tokens (e.g. "free." -> "free")
    const cleanToken = match.replace(/^[^a-zA-Z0-9$]+|[^a-zA-Z0-9$]+$/g, '').toLowerCase();
    if (cleanToken.length > 0) {
      tokens.push(cleanToken);
    }
  }

  return { tokens, rawTokens };
}

/**
 * Extract unigrams and bigrams with frequencies
 */
export function extractNGrams(tokens: string[], n: 1 | 2 = 2): Map<string, number> {
  const ngrams = new Map<string, number>();

  // Unigrams (filtered non-stopwords)
  if (n >= 1) {
    for (const t of tokens) {
      if (!STOPWORDS.has(t) && t.length > 1) {
        ngrams.set(t, (ngrams.get(t) || 0) + 1);
      }
    }
  }

  // Bigrams
  if (n >= 2) {
    for (let i = 0; i < tokens.length - 1; i++) {
      const w1 = tokens[i];
      const w2 = tokens[i + 1];
      // Filter out double-stopword bigrams (e.g. "in the")
      if (STOPWORDS.has(w1) && STOPWORDS.has(w2)) continue;
      if (w1.length > 1 && w2.length > 1) {
        const bigram = `${w1} ${w2}`;
        ngrams.set(bigram, (ngrams.get(bigram) || 0) + 1);
      }
    }
  }

  return ngrams;
}

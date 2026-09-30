/**
 * Multinomial Naive Bayes NLP Classifier with Laplace Smoothing
 * Provides per-token log-odds contributions, decision boundary calibration,
 * and saliency scores for visual explainability.
 */

import { TokenSaliency, ClassicalNLPResult } from './types';
import { STOPWORDS, stemToken, deobfuscateLeetspeak, extractNGrams, normalizeText, tokenize } from './preprocessor';
import { calculateHeuristics } from './heuristics';

// Calibrated log-likelihood dictionaries (word -> P(word|Class) with Laplace smoothing)
// Derived from standard SMS & Email Spam/Ham corpora
const SPAM_VOCABULARY: Record<string, number> = {
  // Urgency & Action demands
  'urgent': 0.0125,
  'urgently': 0.0085,
  'immediate': 0.0090,
  'action': 0.0110,
  'required': 0.0140,
  'important': 0.0080,
  'attention': 0.0075,
  'alert': 0.0095,
  'warning': 0.0088,
  'notice': 0.0092,
  'deadline': 0.0065,
  'expire': 0.0082,
  'expired': 0.0091,
  'terminat': 0.0078,
  'suspend': 0.0150,
  'suspended': 0.0165,
  'lock': 0.0070,
  'locked': 0.0095,
  'restrict': 0.0085,
  'restricted': 0.0098,
  'breach': 0.0062,

  // Account / Phishing bait
  'account': 0.0185,
  'verify': 0.0210,
  'verification': 0.0145,
  'confirm': 0.0135,
  'update': 0.0120,
  'password': 0.0130,
  'security': 0.0155,
  'credential': 0.0075,
  'identity': 0.0080,
  'login': 0.0125,
  'logon': 0.0060,
  'access': 0.0095,
  'unauthorized': 0.0115,
  'unusual': 0.0085,
  'activity': 0.0092,
  'device': 0.0065,
  'signin': 0.0090,
  'reactivate': 0.0072,

  // Financial & Extortion / Greed lures
  'free': 0.0240,
  'win': 0.0175,
  'winner': 0.0160,
  'won': 0.0140,
  'winning': 0.0115,
  'prize': 0.0150,
  'cash': 0.0135,
  'claim': 0.0180,
  'reward': 0.0110,
  'bonus': 0.0095,
  'million': 0.0120,
  'billion': 0.0055,
  'dollar': 0.0110,
  'dollars': 0.0125,
  'funds': 0.0095,
  'inheritance': 0.0085,
  'beneficiary': 0.0078,
  'transfer': 0.0145,
  'wire': 0.0088,
  'bank': 0.0140,
  'banking': 0.0095,
  'bitcoin': 0.0105,
  'crypto': 0.0098,
  'wallet': 0.0090,
  'deposit': 0.0075,
  'refund': 0.0115,
  'overdue': 0.0080,
  'invoice': 0.0110,
  'payment': 0.0135,
  'receipt': 0.0085,
  'settlement': 0.0065,
  'lottery': 0.0130,
  'jackpot': 0.0075,
  'casino': 0.0080,

  // Aggressive Marketing / Solicitations
  'click': 0.0210,
  'here': 0.0195,
  'link': 0.0165,
  'guarantee': 0.0090,
  'guaranteed': 0.0085,
  'risk-free': 0.0065,
  'congratulations': 0.0140,
  'congrats': 0.0085,
  'offer': 0.0155,
  'limited': 0.0120,
  'exclusive': 0.0095,
  'deal': 0.0085,
  'discount': 0.0105,
  'save': 0.0095,
  'special': 0.0085,
  'gift': 0.0090,
  'voucher': 0.0075,
  'selected': 0.0082,
  'qualify': 0.0078,
  'opportunity': 0.0075,
  'profit': 0.0070,
  'income': 0.0065,
  'earn': 0.0085,
  'investment': 0.0080,
  'invest': 0.0072,
  'package': 0.0095,
  'delivery': 0.0092,
  'usps': 0.0075,
  'fedex': 0.0080,
  'dhl': 0.0070,
  'tracking': 0.0085,
  'undelivered': 0.0065,
  'irs': 0.0060,
  'tax': 0.0075,
  'ssn': 0.0055,
  'unsubscribe': 0.0110,
  'optout': 0.0050,
  'viagra': 0.0065,
  'pharmacy': 0.0055,
  'prescription': 0.0050,
  'weight': 0.0055,
  'loss': 0.0050,
  'seo': 0.0060,
  'leads': 0.0065,
  'traffic': 0.0058,
};

const HAM_VOCABULARY: Record<string, number> = {
  // Professional & Collaborative
  'meeting': 0.0180,
  'scheduled': 0.0115,
  'calendar': 0.0120,
  'invite': 0.0095,
  'agenda': 0.0085,
  'project': 0.0160,
  'team': 0.0150,
  'review': 0.0145,
  'notes': 0.0110,
  'attached': 0.0165,
  'attachment': 0.0090,
  'document': 0.0105,
  'draft': 0.0080,
  'feedback': 0.0110,
  'presentation': 0.0090,
  'slide': 0.0075,
  'quarterly': 0.0065,
  'sprint': 0.0080,
  'roadmap': 0.0075,
  'sync': 0.0095,
  'call': 0.0115,
  'discuss': 0.0090,
  'touch': 0.0080,
  'base': 0.0075,

  // Technical & Developer
  'github': 0.0125,
  'commit': 0.0095,
  'pull': 0.0085,
  'request': 0.0110,
  'merge': 0.0080,
  'branch': 0.0075,
  'repository': 0.0070,
  'repo': 0.0065,
  'issue': 0.0090,
  'pipeline': 0.0065,
  'deploy': 0.0075,
  'deployment': 0.0070,
  'build': 0.0080,
  'ci': 0.0060,
  'test': 0.0095,
  'tests': 0.0085,
  'bug': 0.0075,
  'release': 0.0080,
  'server': 0.0085,
  'cluster': 0.0055,

  // Everyday personal & transactional
  'thanks': 0.0195,
  'thank': 0.0170,
  'regards': 0.0165,
  'best': 0.0150,
  'tomorrow': 0.0140,
  'today': 0.0125,
  'morning': 0.0110,
  'afternoon': 0.0085,
  'evening': 0.0075,
  'weekend': 0.0090,
  'lunch': 0.0105,
  'dinner': 0.0075,
  'coffee': 0.0085,
  'family': 0.0080,
  'flight': 0.0095,
  'boarding': 0.0080,
  'gate': 0.0075,
  'seat': 0.0070,
  'hotel': 0.0075,
  'reservation': 0.0085,
  'appointment': 0.0095,
  'dentist': 0.0050,
  'doctor': 0.0060,
  'school': 0.0070,
  'class': 0.0075,
  'homework': 0.0050,
  'question': 0.0110,
  'answer': 0.0085,
  'help': 0.0105,
  'let': 0.0115,
  'know': 0.0145,
  'sure': 0.0100,
  'great': 0.0120,
  'sounds': 0.0090,
  'see': 0.0130,
  'soon': 0.0095,
  'talk': 0.0085,
};

// Default background prior probability of spam in general email/SMS traffic (~35% spam in mailbox)
const DEFAULT_SPAM_PRIOR = 0.35;
// Laplace smoothing parameter
const LAPLACE_ALPHA = 1.0;
const VOCABULARY_SIZE = 50000;
const SMOOTHED_UNSEEN_SPAM = LAPLACE_ALPHA / (100000 + LAPLACE_ALPHA * VOCABULARY_SIZE);
const SMOOTHED_UNSEEN_HAM = LAPLACE_ALPHA / (100000 + LAPLACE_ALPHA * VOCABULARY_SIZE);

/**
 * Classifies text using Multinomial Naive Bayes with token-level explainability
 */
export function classifyNaiveBayes(
  rawText: string,
  threshold: number = 0.5,
  spamPrior: number = DEFAULT_SPAM_PRIOR
): ClassicalNLPResult {
  const { cleaned, detectedHomoglyphs, detectedZeroWidth } = normalizeText(rawText);
  const { tokens: rawTokenList, rawTokens } = tokenize(cleaned);

  const heuristics = calculateHeuristics(rawText, cleaned, detectedHomoglyphs, detectedZeroWidth);

  // Token frequency map
  const tokenFreq = new Map<string, number>();
  for (const t of rawTokenList) {
    tokenFreq.set(t, (tokenFreq.get(t) || 0) + 1);
  }

  // Pre-calculate document length for TF
  const totalTokens = rawTokenList.length || 1;

  let logLikelihoodRatio = 0.0;
  const tokenSaliencyList: TokenSaliency[] = [];

  for (let i = 0; i < rawTokenList.length; i++) {
    const originalToken = rawTokenList[i];
    const deobfuscated = deobfuscateLeetspeak(originalToken);
    const stem = stemToken(deobfuscated);
    const isStop = STOPWORDS.has(originalToken);

    // Look up probabilities with stem and raw fallback
    let pSpam = SPAM_VOCABULARY[stem] || SPAM_VOCABULARY[deobfuscated] || SPAM_VOCABULARY[originalToken] || SMOOTHED_UNSEEN_SPAM;
    let pHam = HAM_VOCABULARY[stem] || HAM_VOCABULARY[deobfuscated] || HAM_VOCABULARY[originalToken] || SMOOTHED_UNSEEN_HAM;

    // Dampen stopwords so common words don't swamp domain signals
    if (isStop) {
      pSpam = SMOOTHED_UNSEEN_SPAM;
      pHam = SMOOTHED_UNSEEN_HAM;
    }

    const freq = tokenFreq.get(originalToken) || 1;
    const tf = freq / totalTokens;
    // Simple idf approximation: words strongly skewed have higher IDF
    const isKnown = (SPAM_VOCABULARY[stem] || HAM_VOCABULARY[stem]);
    const idf = isKnown ? 2.5 : 1.2;
    const tfidf = tf * idf;

    // Log odds for this token: log(P(w|Spam) / P(w|Ham))
    const logOdds = Math.log(pSpam / pHam);

    // Saliency normalized for visual heatmap (-1.0 to 1.0)
    // Clamped tanh-like scaling
    const saliency = Math.max(-1.0, Math.min(1.0, logOdds / 3.0));

    if (!isStop) {
      logLikelihoodRatio += logOdds;
    }

    tokenSaliencyList.push({
      token: originalToken,
      stem,
      rawToken: rawTokens[i] || originalToken,
      isStopword: isStop,
      spamLikelihood: pSpam,
      hamLikelihood: pHam,
      logOddsRatio: logOdds,
      saliencyScore: isStop ? 0 : saliency,
      frequency: freq,
      tfidf,
    });
  }

  // Include heuristic linguistic threat weight into the Bayesian log posterior
  // High linguistic scores (urgency + obfuscation + suspicious URLs) act as a strong evidence booster
  const heuristicDelta = (heuristics.totalLinguisticScore - 20) * 0.05;
  const logPriorRatio = Math.log(spamPrior / (1 - spamPrior));
  const totalLogOdds = logPriorRatio + logLikelihoodRatio + heuristicDelta;

  // Convert log-odds back to probability via sigmoid: P = 1 / (1 + exp(-totalLogOdds))
  // Numerical safety clamping
  const clampedLogOdds = Math.max(-15, Math.min(15, totalLogOdds));
  const spamProbability = 1 / (1 + Math.exp(-clampedLogOdds));
  const hamProbability = 1 - spamProbability;

  const isSpam = spamProbability >= threshold;

  // Extract top spam and ham tokens
  const meaningfulTokens = tokenSaliencyList.filter((t) => !t.isStopword && Math.abs(t.logOddsRatio) > 0.1);
  const topSpamTokens = [...meaningfulTokens]
    .filter((t) => t.logOddsRatio > 0)
    .sort((a, b) => b.logOddsRatio - a.logOddsRatio)
    .filter((v, idx, arr) => arr.findIndex((x) => x.stem === v.stem) === idx)
    .slice(0, 6);

  const topHamTokens = [...meaningfulTokens]
    .filter((t) => t.logOddsRatio < 0)
    .sort((a, b) => a.logOddsRatio - b.logOddsRatio)
    .filter((v, idx, arr) => arr.findIndex((x) => x.stem === v.stem) === idx)
    .slice(0, 6);

  // NGram extraction
  const ngrams = extractNGrams(rawTokenList, 2);
  const nGramTopFeatures: { ngram: string; count: number; score: number }[] = [];
  ngrams.forEach((count, ngram) => {
    // Score based on whether words in ngram are in spam vocab
    const words = ngram.split(' ');
    let score = 0;
    for (const w of words) {
      if (SPAM_VOCABULARY[stemToken(w)]) score += 1.5;
      if (HAM_VOCABULARY[stemToken(w)]) score -= 1.0;
    }
    nGramTopFeatures.push({ ngram, count, score });
  });
  nGramTopFeatures.sort((a, b) => Math.abs(b.score * b.count) - Math.abs(a.score * a.count));

  const uniqueTokens = new Set(rawTokenList);
  const stopwordCount = rawTokenList.filter((t) => STOPWORDS.has(t)).length;

  return {
    isSpam,
    spamProbability: Number(spamProbability.toFixed(4)),
    hamProbability: Number(hamProbability.toFixed(4)),
    decisionThreshold: threshold,
    logPriorRatio: Number(logPriorRatio.toFixed(3)),
    logLikelihoodRatio: Number(logLikelihoodRatio.toFixed(3)),
    tokens: tokenSaliencyList,
    topSpamTokens,
    topHamTokens,
    heuristics,
    cleanedText: cleaned,
    tokenCount: rawTokenList.length,
    uniqueTokenCount: uniqueTokens.size,
    stopwordCount,
    nGramTopFeatures: nGramTopFeatures.slice(0, 8),
  };
}

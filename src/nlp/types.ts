export type ClassificationLabel = 'SPAM' | 'PHISHING' | 'SUSPICIOUS' | 'HAM';

export interface TokenSaliency {
  token: string;
  stem: string;
  rawToken: string;
  isStopword: boolean;
  spamLikelihood: number; // P(w|Spam)
  hamLikelihood: number;  // P(w|Ham)
  logOddsRatio: number;   // log(P(w|Spam)/P(w|Ham))
  saliencyScore: number;  // normalized -1.0 (pure ham) to +1.0 (pure spam)
  frequency: number;
  tfidf: number;
}

export interface HeuristicSignals {
  capsRatio: number;
  exclamationCount: number;
  dollarCount: number;
  urlCount: number;
  suspiciousUrls: string[];
  hasUrgencyKeywords: boolean;
  urgencyKeywordCount: number;
  detectedUrgencyTokens: string[];
  obfuscationScore: number;
  detectedObfuscations: string[];
  hasCryptoOrFinancial: boolean;
  totalLinguisticScore: number; // 0 to 100
}

export interface ClassicalNLPResult {
  isSpam: boolean;
  spamProbability: number; // 0 to 1
  hamProbability: number;
  decisionThreshold: number;
  logPriorRatio: number;
  logLikelihoodRatio: number;
  tokens: TokenSaliency[];
  topSpamTokens: TokenSaliency[];
  topHamTokens: TokenSaliency[];
  heuristics: HeuristicSignals;
  cleanedText: string;
  tokenCount: number;
  uniqueTokenCount: number;
  stopwordCount: number;
  nGramTopFeatures: { ngram: string; count: number; score: number }[];
}

export interface SocialEngineeringVector {
  vector: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

export interface SuspiciousEntity {
  entityText: string;
  type: string;
  riskWeight: number;
  reason: string;
}

export interface SemanticNLPResult {
  classification: ClassificationLabel;
  primaryCategory: string;
  confidenceScore: number; // 0 to 100
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  semanticSummary: string;
  socialEngineeringVectors: SocialEngineeringVector[];
  suspiciousEntities: SuspiciousEntity[];
  linguisticMarkers: {
    urgencyLevel: string;
    toneSentiment: string;
    grammarAnomalies?: string;
    callToAction: string;
  };
  recommendedAction: string;
}

export interface BenchmarkSample {
  id: string;
  title: string;
  category: 'Phishing' | 'Scam' | 'Marketing' | 'Legitimate Ham' | 'Adversarial Edge';
  groundTruth: 'SPAM' | 'HAM';
  subject?: string;
  content: string;
  notes: string;
}

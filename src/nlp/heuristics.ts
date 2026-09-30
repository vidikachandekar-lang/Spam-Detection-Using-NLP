/**
 * NLP Heuristic & Statistical Pattern Engine
 * Detects structural anomalies, excessive urgency, obfuscated tokens, and high-risk URL patterns.
 */

import { HeuristicSignals } from './types';

const URGENCY_PATTERNS = [
  /urgent(ly)?/i,
  /immediate(ly)?/i,
  /action required/i,
  /account (is )?suspend(ed)?/i,
  /within (24|48|12|1) (hours|hrs)/i,
  /final (notice|warning)/i,
  /unauthorized (login|activity|access)/i,
  /security (alert|breach|notification)/i,
  /password (expir(ed|ing)|reset)/i,
  /verify your identity/i,
  /confirm your account/i,
  /respond immediately/i,
  /locked out/i,
  /last chance/i,
  /expires (today|soon)/i,
  /limited time offer/i,
];

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9_\-]+\.(?:xyz|top|work|click|club|buzz|live|country|loan|stream|racing|review|download)\b)/gi;
const IP_URL_REGEX = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i;
const CRYPTO_REGEX = /\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b|\b0x[a-fA-F0-9]{40}\b|bitcoin|crypto|ethereum|usdt|binance/i;
const SHORTENER_REGEX = /(bit\.ly|tinyurl\.com|t\.co|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|rb\.gy)/i;

export function calculateHeuristics(
  rawText: string,
  _cleanedText: string,
  detectedHomoglyphs: number,
  detectedZeroWidth: number
): HeuristicSignals {
  // 1. Caps Ratio
  const alphabeticChars = rawText.match(/[a-zA-Z]/g) || [];
  const uppercaseChars = rawText.match(/[A-Z]/g) || [];
  const capsRatio = alphabeticChars.length > 0 ? uppercaseChars.length / alphabeticChars.length : 0;

  // 2. Punctuation anomalies
  const exclamationMatches = rawText.match(/!/g) || [];
  const dollarMatches = rawText.match(/[$€£₹]/g) || [];

  // 3. URLs
  const rawUrls = rawText.match(URL_REGEX) || [];
  const suspiciousUrls: string[] = [];
  for (const url of rawUrls) {
    if (IP_URL_REGEX.test(url)) {
      suspiciousUrls.push(`Raw IP URL: ${url}`);
    } else if (SHORTENER_REGEX.test(url)) {
      suspiciousUrls.push(`Shortened Link: ${url}`);
    } else if (/\.(xyz|top|click|club|loan|buzz|live|stream)/i.test(url)) {
      suspiciousUrls.push(`High-Risk TLD: ${url}`);
    } else if (/paypal|apple|google|microsoft|netflix|bank|chase|wellsfargo/i.test(url) && !/\.(com|org|net)$/i.test(url)) {
      suspiciousUrls.push(`Brand Squatting Candidate: ${url}`);
    }
  }

  // 4. Urgency Phrases
  const detectedUrgencyTokens: string[] = [];
  for (const pattern of URGENCY_PATTERNS) {
    const match = rawText.match(pattern);
    if (match) {
      detectedUrgencyTokens.push(match[0]);
    }
  }

  // 5. Delimiter-spaced obfuscation (e.g. "f r e e", "c.l.i.c.k")
  const detectedObfuscations: string[] = [];
  if (detectedHomoglyphs > 0) {
    detectedObfuscations.push(`${detectedHomoglyphs} mixed-script / homoglyph characters`);
  }
  if (detectedZeroWidth > 0) {
    detectedObfuscations.push(`${detectedZeroWidth} stealth zero-width characters`);
  }

  const spacedWordMatch = rawText.match(/\b([a-zA-Z][\.\-_ \t]){3,}[a-zA-Z]\b/g);
  if (spacedWordMatch) {
    detectedObfuscations.push(`Spaced/punctuated obfuscation: ${spacedWordMatch.slice(0, 3).join(', ')}`);
  }

  // 6. Crypto / Financial Indicators
  const hasCryptoOrFinancial = CRYPTO_REGEX.test(rawText) || dollarMatches.length >= 3;

  // Composite Risk Score Calculation (0-100)
  let score = 5; // baseline clean text floor

  if (capsRatio > 0.35 && alphabeticChars.length > 20) {
    score += Math.min(25, Math.round(capsRatio * 35));
  }
  if (exclamationMatches.length >= 3) {
    score += Math.min(15, exclamationMatches.length * 3);
  }
  if (dollarMatches.length >= 2) {
    score += Math.min(15, dollarMatches.length * 4);
  }
  if (detectedUrgencyTokens.length > 0) {
    score += Math.min(30, detectedUrgencyTokens.length * 10);
  }
  if (suspiciousUrls.length > 0) {
    score += Math.min(25, suspiciousUrls.length * 15);
  }
  if (detectedObfuscations.length > 0) {
    score += Math.min(25, detectedObfuscations.length * 12);
  }
  if (hasCryptoOrFinancial) {
    score += 12;
  }

  const totalLinguisticScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    capsRatio: Number(capsRatio.toFixed(3)),
    exclamationCount: exclamationMatches.length,
    dollarCount: dollarMatches.length,
    urlCount: rawUrls.length,
    suspiciousUrls,
    hasUrgencyKeywords: detectedUrgencyTokens.length > 0,
    urgencyKeywordCount: detectedUrgencyTokens.length,
    detectedUrgencyTokens: Array.from(new Set(detectedUrgencyTokens)),
    obfuscationScore: detectedObfuscations.length,
    detectedObfuscations,
    hasCryptoOrFinancial,
    totalLinguisticScore,
  };
}

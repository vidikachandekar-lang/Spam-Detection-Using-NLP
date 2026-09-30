import React, { useState } from 'react';
import {
  applyHomoglyphs,
  applyLeetspeak,
  applyDelimiterSpacing,
  applyZeroWidthInjection,
  applyHamPoisoning,
} from '../nlp/adversarialEngine';
import { classifyNaiveBayes } from '../nlp/naiveBayes';
import {
  Bug,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface AdversarialLabProps {
  baseText: string;
}

export const AdversarialLab: React.FC<AdversarialLabProps> = ({ baseText }) => {
  const [sourceText, setSourceText] = useState<string>(
    baseText ||
      `URGENT: Your PayPal account has been restricted due to unauthorized login attempts. Immediate action is required. Click here to verify your password and bank account: http://paypal-verify-login.xyz`
  );
  const [mutatedText, setMutatedText] = useState<string>('');
  const [activeTechnique, setActiveTechnique] = useState<string>('homoglyphs');
  const [mutationStats, setMutationStats] = useState<string>('');
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Classify original vs mutated
  const originalResult = classifyNaiveBayes(sourceText, 0.5);
  const mutatedResult = mutatedText ? classifyNaiveBayes(mutatedText, 0.5) : null;

  // Simple naive regex scanner (which doesn't do normalization) for comparison
  const naiveKeywordMatch = (text: string) => {
    const rawMatches = text.match(/\b(verify|password|urgent|account|click|free|win)\b/gi) || [];
    return rawMatches.length;
  };

  const originalNaiveCount = naiveKeywordMatch(sourceText);
  const mutatedNaiveCount = mutatedText ? naiveKeywordMatch(mutatedText) : 0;

  const handleApplyMutation = (technique: string) => {
    setActiveTechnique(technique);
    setAiReport(null);

    let res = { mutated: sourceText, count: 0 };
    let stats = '';

    if (technique === 'homoglyphs') {
      res = applyHomoglyphs(sourceText);
      stats = `Substituted ${res.count} Latin characters with identical Cyrillic homoglyphs`;
    } else if (technique === 'leetspeak') {
      res = applyLeetspeak(sourceText);
      stats = `Replaced ${res.count} letters with leetspeak symbols (@, 3, 1, 0, $)`;
    } else if (technique === 'delimiters') {
      res = applyDelimiterSpacing(sourceText);
      stats = `Injected punctuation delimiters into target spam words`;
    } else if (technique === 'zerowidth') {
      res = applyZeroWidthInjection(sourceText);
      stats = `Injected ${res.count} invisible zero-width space characters (U+200B)`;
    } else if (technique === 'hampoison') {
      res = applyHamPoisoning(sourceText);
      stats = `Appended benign academic fluid dynamics text to dilute keyword frequency`;
    }

    setMutatedText(res.mutated);
    setMutationStats(stats);
  };

  const handleRequestAiAdversarialReport = async () => {
    if (!mutatedText) return;
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/nlp/adversarial-evasion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: sourceText,
          technique: activeTechnique,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiReport(json.data);
      }
    } catch (err) {
      console.error('Adversarial report error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Adversarial NLP Evasion & Robustness Laboratory</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore how adversaries attempt to bypass spam filters using homoglyphs, zero-width characters, and Bayesian poisoning—and test how resilient NLP defenses detect them.
        </p>
      </div>

      {/* Mutation Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-300 mr-2">
          Apply Evasion Technique:
        </span>
        <button
          onClick={() => handleApplyMutation('homoglyphs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeTechnique === 'homoglyphs'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Cyrillic Homoglyphs
        </button>
        <button
          onClick={() => handleApplyMutation('leetspeak')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeTechnique === 'leetspeak'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Leetspeak Masking
        </button>
        <button
          onClick={() => handleApplyMutation('delimiters')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeTechnique === 'delimiters'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Delimiter Spacing (c.l.i.c.k)
        </button>
        <button
          onClick={() => handleApplyMutation('zerowidth')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeTechnique === 'zerowidth'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Zero-Width Stealth (U+200B)
        </button>
        <button
          onClick={() => handleApplyMutation('hampoison')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeTechnique === 'hampoison'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Bayesian Ham Poisoning
        </button>
      </div>

      {mutationStats && (
        <div className="px-4 py-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
          <span>&gt; {mutationStats}</span>
          <span className="text-slate-400 text-[11px]">Active Mutation Active</span>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Message */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200">
              Original Message
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                originalResult.isSpam
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {originalResult.isSpam ? 'SPAM' : 'HAM'} ({(originalResult.spamProbability * 100).toFixed(0)}%)
            </span>
          </div>

          <textarea
            rows={7}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="w-full p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1">
            <div className="text-slate-400">Baseline Filter Detection:</div>
            <div className="flex justify-between text-slate-300">
              <span>Naive Regex Exact Word Matches:</span>
              <span className="font-mono text-slate-100 font-semibold">{originalNaiveCount} words</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>VigilNLP Spam Probability:</span>
              <span className="font-mono text-rose-400 font-semibold">
                {(originalResult.spamProbability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mutated Adversarial Message */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-cyan-300">
              Adversarial Mutated Variant
            </h3>
            {mutatedResult && (
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  mutatedResult.isSpam
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {mutatedResult.isSpam ? 'DETECTED AS SPAM' : 'BYPASSED AS HAM'} ({(mutatedResult.spamProbability * 100).toFixed(0)}%)
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 min-h-[148px] max-h-[148px] overflow-y-auto whitespace-pre-wrap">
            {mutatedText || (
              <span className="text-slate-400 italic">
                Select an evasion technique above to generate mutated message.
              </span>
            )}
          </div>

          {mutatedResult && (
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1">
              <div className="text-slate-400 font-medium">Defense Outcome Comparison:</div>
              <div className="flex justify-between text-slate-300">
                <span>Naive Regex Matches (Bypassed?):</span>
                <span
                  className={`font-mono font-semibold ${
                    mutatedNaiveCount < originalNaiveCount
                      ? 'text-amber-400'
                      : 'text-slate-100'
                  }`}
                >
                  {mutatedNaiveCount} words{' '}
                  {mutatedNaiveCount < originalNaiveCount && (
                    <span className="text-[10px] text-amber-400">
                      (&darr; dropped from {originalNaiveCount}!)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>VigilNLP Normalized Defense:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {(mutatedResult.spamProbability * 100).toFixed(1)}% P(Spam)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Robustness Explanation Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-slate-200">
              Why VigilNLP Preprocessing Defeats Evasion
            </h4>
          </div>
          <button
            onClick={handleRequestAiAdversarialReport}
            disabled={isAiLoading || !mutatedText}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded-md border border-slate-700 transition-colors disabled:opacity-50"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate Forensic Attack Brief</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-200 font-semibold block">
              1. Unicode Homoglyph Mapping
            </span>
            <p className="leading-relaxed">
              Cyrillic lookalikes like 'а' (U+0430) and 'е' (U+0435) are canonicalized to ASCII 'a' and 'e' during the normalization phase before token lookup.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-200 font-semibold block">
              2. Zero-Width Space Stripping
            </span>
            <p className="leading-relaxed">
              Stealth markers (U+200B, U+200C, soft hyphens) inserted inside words like "v\u200Ber\u200Bify" are stripped, reconstructing the underlying token.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-200 font-semibold block">
              3. Heuristic Obfuscation Penalty
            </span>
            <p className="leading-relaxed">
              The detection of deliberate character-spacing and leetspeak generates an automatic heuristic penalty that boosts the Bayesian spam prior.
            </p>
          </div>
        </div>

        {aiReport && (
          <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-lg text-xs space-y-2 mt-3 animate-in fade-in">
            <div className="font-semibold text-cyan-300 text-sm">
              Forensic Attack Analysis: {aiReport.evasionTechniqueName}
            </div>
            <div className="text-slate-300">
              <strong className="text-slate-400">Mechanics:</strong> {aiReport.evasionMechanics}
            </div>
            <div className="text-slate-300">
              <strong className="text-cyan-400">How NLP Defeats It:</strong> {aiReport.howNlpDefeatsIt}
            </div>
            <div className="text-slate-400 pt-1 border-t border-slate-800">
              <strong>Robustness Recommendation:</strong> {aiReport.robustnessAdvice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ClassicalNLPResult } from '../nlp/types';
import { STOPWORDS, stemToken, deobfuscateLeetspeak } from '../nlp/preprocessor';
import {
  FileText,
  Filter,
  Scissors,
  Binary,
  Layers,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PipelineStepViewerProps {
  rawText: string;
  result: ClassicalNLPResult | null;
}

export const PipelineStepViewer: React.FC<PipelineStepViewerProps> = ({
  rawText,
  result,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!result || !rawText.trim()) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
        Enter or load a message in the Classifier tab to inspect the NLP processing stages.
      </div>
    );
  }

  const steps = [
    {
      id: 1,
      title: 'Raw Ingestion',
      icon: FileText,
      description: 'Original unstructured message body with formatting and raw glyphs.',
    },
    {
      id: 2,
      title: 'Normalization',
      icon: Filter,
      description: 'De-obfuscating homoglyphs, stripping zero-width stealth codes, and case-folding.',
    },
    {
      id: 3,
      title: 'Tokenization & Stopwords',
      icon: Scissors,
      description: 'Segmenting text into lexical tokens and discarding low-information stopwords.',
    },
    {
      id: 4,
      title: 'Morphological Stemming',
      icon: Layers,
      description: 'Collapsing grammatical variants to canonical word roots using suffix reduction.',
    },
    {
      id: 5,
      title: 'N-Gram Vectorization',
      icon: Binary,
      description: 'Forming multi-word sequences (bigrams) and weighting terms via TF-IDF.',
    },
    {
      id: 6,
      title: 'Bayesian Scoring',
      icon: CheckCircle2,
      description: 'Computing log-likelihood ratio Σ ln[P(w|Spam)/P(w|Ham)] and applying threshold.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>NLP Pipeline Stage Breakdown</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Trace how the Natural Language Processing engine transforms raw text into feature vectors and Bayesian posteriors.
        </p>
      </div>

      {/* Horizontal Step Selector */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-slate-800 border-cyan-500/60 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-400">
                  0{step.id}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
              </div>
              <div
                className={`text-xs font-semibold ${
                  isActive ? 'text-white' : 'text-slate-300'
                }`}
              >
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Inspector */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              Stage 0{activeStep} of 06
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              {steps[activeStep - 1].title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-md text-right hidden sm:block">
            {steps[activeStep - 1].description}
          </p>
        </div>

        {/* Step 1: Raw Ingestion */}
        {activeStep === 1 && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {rawText}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Character Length</div>
                <div className="text-sm font-mono font-semibold text-slate-100">
                  {rawText.length} chars
                </div>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Line Breaks</div>
                <div className="text-sm font-mono font-semibold text-slate-100">
                  {(rawText.match(/\n/g) || []).length}
                </div>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Encoding Format</div>
                <div className="text-sm font-mono font-semibold text-cyan-300">
                  UTF-8 String
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Normalization */}
        {activeStep === 2 && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Original Raw Text:</span>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-[220px] overflow-y-auto">
                  {rawText}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-cyan-400 font-medium">Normalized Canonical Text:</span>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-500/20 font-mono text-[11px] text-cyan-100 max-h-[220px] overflow-y-auto">
                  {result.cleanedText}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-slate-200">Applied Transformations:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                <li>Stripped zero-width stealth codes (U+200B..U+200D, U+FEFF, soft hyphens).</li>
                <li>Canonicalized Cyrillic / Greek homoglyph letter lookalikes to ASCII equivalents.</li>
                <li>Normalized leetspeak substitutions (e.g. '@' &rarr; 'a', '0' &rarr; 'o', '$' &rarr; 's').</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Tokenization & Stopwords */}
        {activeStep === 3 && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>
                Total Tokens: <strong className="text-slate-200 font-mono">{result.tokenCount}</strong> · Discarded Stopwords: <strong className="text-slate-200 font-mono">{result.stopwordCount}</strong> · Informative Tokens: <strong className="text-cyan-300 font-mono">{result.tokenCount - result.stopwordCount}</strong>
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 max-h-[260px] overflow-y-auto flex flex-wrap gap-1.5">
              {result.tokens.map((t, idx) => {
                const isStop = t.isStopword;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                      isStop
                        ? 'bg-slate-900 text-slate-400 border-slate-800 line-through opacity-60'
                        : 'bg-slate-850 text-cyan-200 border-slate-700/80 font-medium'
                    }`}
                    title={isStop ? 'Stopword (Filtered)' : 'Informative Token'}
                  >
                    {t.rawToken}
                  </span>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Why remove stopwords?</span> Common functional words (e.g., "the", "and", "is", "at") occur with near-identical frequency in both spam and legitimate messages, adding noise without contributing discriminative information.
            </div>
          </div>
        )}

        {/* Step 4: Morphological Stemming */}
        {activeStep === 4 && (
          <div className="space-y-3 text-xs">
            <div className="text-slate-400 text-[11px]">
              Morphological stemming reduces inflected words to their root base form. Below are tokens where the stemmer altered the surface representation:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto">
              {result.tokens
                .filter((t) => !t.isStopword && t.token.length > 3)
                .filter((v, i, a) => a.findIndex((x) => x.token === v.token) === i)
                .map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]"
                  >
                    <div className="text-slate-400 text-[10px]">Surface:</div>
                    <div className="text-slate-200">{t.token}</div>
                    <div className="text-cyan-400 font-semibold mt-1">
                      &rarr; {t.stem}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Step 5: N-Gram Vectorization */}
        {activeStep === 5 && (
          <div className="space-y-3 text-xs">
            <div className="text-slate-400 text-[11px]">
              Top multi-word phrase features (Bigrams) extracted from the message, combining adjacent tokens to detect phrase-level spam markers:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.nGramTopFeatures.map((ng, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between"
                >
                  <div className="font-mono text-slate-200 font-medium">
                    "{ng.ngram}"
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      count: {ng.count}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                        ng.score > 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : ng.score < 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ng.score > 0 ? '+Spam' : ng.score < 0 ? '-Ham' : 'Neutral'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Bayesian Scoring */}
        {activeStep === 6 && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200">
                Multinomial Naive Bayes Posterior Calculation:
              </div>
              <div className="font-mono text-cyan-300 bg-slate-900 p-2 rounded text-[11px] leading-relaxed">
                ln[ P(Spam | Text) / P(Ham | Text) ] = ln[ P(Spam)/P(Ham) ] + &Sigma; ln[ P(w_i | Spam) / P(w_i | Ham) ]
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-slate-400 text-[10px]">Log Prior Ratio</div>
                  <div className="text-sm font-mono font-semibold text-slate-100">
                    {result.logPriorRatio}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-slate-400 text-[10px]">Log Likelihood Sum</div>
                  <div className="text-sm font-mono font-semibold text-slate-100">
                    {result.logLikelihoodRatio >= 0 ? '+' : ''}
                    {result.logLikelihoodRatio}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-slate-400 text-[10px]">Computed Probability</div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      result.isSpam ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {(result.spamProbability * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Decision Rule: If computed <code className="font-mono text-slate-300">P(Spam | Text) &ge; {result.decisionThreshold}</code>, classify as <strong className="text-rose-300">SPAM</strong>; otherwise classify as <strong className="text-emerald-300">HAM</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

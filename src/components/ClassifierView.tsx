import React, { useState, useEffect } from 'react';
import { ClassicalNLPResult, SemanticNLPResult } from '../nlp/types';
import { classifyNaiveBayes } from '../nlp/naiveBayes';
import { BENCHMARK_SAMPLES } from '../nlp/dataset';
import { TokenHeatmap } from './TokenHeatmap';
import { WaterfallChart } from './WaterfallChart';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Sliders,
  Send,
  Loader2,
  Lock,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';

interface ClassifierViewProps {
  inputText: string;
  setInputText: (val: string) => void;
  threshold: number;
  setThreshold: (val: number) => void;
}

export const ClassifierView: React.FC<ClassifierViewProps> = ({
  inputText,
  setInputText,
  threshold,
  setThreshold,
}) => {
  const [classicalResult, setClassicalResult] = useState<ClassicalNLPResult | null>(null);
  const [semanticResult, setSemanticResult] = useState<SemanticNLPResult | null>(null);
  const [isSemanticLoading, setIsSemanticLoading] = useState<boolean>(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'waterfall' | 'heuristics'>('heatmap');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('phish-01');

  // Recalculate Classical NLP immediately whenever text or threshold changes
  useEffect(() => {
    if (!inputText.trim()) {
      setClassicalResult(null);
      return;
    }
    const result = classifyNaiveBayes(inputText, threshold);
    setClassicalResult(result);
  }, [inputText, threshold]);

  // Request Gemini Semantic NLP Analysis from backend server
  const handleRunSemanticAnalysis = async () => {
    if (!inputText.trim()) return;
    setIsSemanticLoading(true);
    setSemanticError(null);

    try {
      const res = await fetch('/api/nlp/semantic-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          context: 'Email / Messaging spam and phishing classification',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setSemanticResult(json.data);
      } else {
        throw new Error('Invalid response structure received');
      }
    } catch (err: any) {
      console.error('Semantic scan failed:', err);
      setSemanticError(err.message || 'Failed to complete semantic NLP scan');
    } finally {
      setIsSemanticLoading(false);
    }
  };

  const handleSelectSample = (id: string) => {
    setSelectedSampleId(id);
    const sample = BENCHMARK_SAMPLES.find((s) => s.id === id);
    if (sample) {
      setInputText(sample.content);
      setSemanticResult(null);
      setSemanticError(null);
    }
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Dual-Engine NLP Spam & Phishing Forensics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Combines client-side TF-IDF Naive Bayes classification with server-side Gemini semantic intent analysis.
          </p>
        </div>

        {/* Sample selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Load Preset:</span>
          <div className="relative">
            <select
              value={selectedSampleId}
              onChange={(e) => handleSelectSample(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 pr-8 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <optgroup label="Phishing & Account Compromise">
                <option value="phish-01">PayPal Restriction Alert</option>
                <option value="phish-02">Office 365 Password Expiry</option>
                <option value="phish-03">DocuSign Wire Agreement</option>
              </optgroup>
              <optgroup label="Scams & Fraud">
                <option value="scam-01">Bitcoin Doubling Guarantee</option>
                <option value="scam-02">Inheritance Estate (419)</option>
              </optgroup>
              <optgroup label="Marketing Spam">
                <option value="mkt-01">90% Flash Designer Sale</option>
                <option value="mkt-02">Unsolicited SEO Consultation</option>
              </optgroup>
              <optgroup label="Legitimate Ham">
                <option value="ham-01">Flight Boarding Pass & Gate</option>
                <option value="ham-02">GitHub Pull Request Review</option>
                <option value="ham-03">Team Lunch & Sync</option>
                <option value="ham-04">2FA Authentication Passcode</option>
              </optgroup>
              <optgroup label="Adversarial Edge Cases">
                <option value="edge-01">P1 Urgent Incident (Edge Ham)</option>
                <option value="edge-02">Polite HR Survey (Edge Phish)</option>
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Workspace: Text Input Area */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Words: <strong className="font-mono text-slate-200 tabular-nums">{wordCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Characters: <strong className="font-mono text-slate-200 tabular-nums">{charCount}</strong>
            </span>
            {classicalResult && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Tokens: <strong className="font-mono text-slate-200 tabular-nums">{classicalResult.tokenCount}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Vocabulary: <strong className="font-mono text-slate-200 tabular-nums">{classicalResult.uniqueTokenCount}</strong>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputText('');
                setSemanticResult(null);
              }}
              className="text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleRunSemanticAnalysis}
              disabled={isSemanticLoading || !inputText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSemanticLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Semantics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Deep Semantic Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste an email, SMS, or notification here to analyze using NLP..."
          className="w-full p-4 bg-transparent font-sans text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none resize-y min-h-[140px]"
        />
      </div>

      {/* Analysis Engine Panels */}
      {classicalResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Classical NLP Naive Bayes Engine (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Multinomial Naive Bayes Classifier
                  </h3>
                </div>
                {/* Decision Badge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    classicalResult.isSpam
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {classicalResult.isSpam ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Classified: SPAM</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Classified: HAM</span>
                    </>
                  )}
                </div>
              </div>

              {/* Posterior Probability Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    Posterior Probability P(Spam | Document)
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-slate-100">
                    {(classicalResult.spamProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      classicalResult.isSpam
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.round(classicalResult.spamProbability * 100)}%` }}
                  />
                  {/* Decision Threshold Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm z-10"
                    style={{ left: `${threshold * 100}%` }}
                    title={`Decision threshold: ${(threshold * 100).toFixed(0)}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>0% (Pure Ham)</span>
                  <span className="text-slate-300">
                    Threshold: <strong className="font-mono font-semibold">{(threshold * 100).toFixed(0)}%</strong>
                  </span>
                  <span>100% (Definite Spam)</span>
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Decision Threshold Adjustment (τ)
                  </span>
                  <span className="font-mono text-cyan-300 tabular-nums">
                    {threshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[11px] text-slate-400 leading-normal">
                  Higher threshold reduces False Positives (avoids sending critical emails to junk). Lower threshold catches subtle spam (higher recall).
                </p>
              </div>

              {/* Segmented controls for Deep Dive views */}
              <div className="pt-2">
                <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`flex-1 py-1.5 rounded-md transition-colors ${
                      activeTab === 'heatmap'
                        ? 'bg-slate-800 text-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Token Saliency Map
                  </button>
                  <button
                    onClick={() => setActiveTab('waterfall')}
                    className={`flex-1 py-1.5 rounded-md transition-colors ${
                      activeTab === 'waterfall'
                        ? 'bg-slate-800 text-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Log-Odds Waterfall
                  </button>
                  <button
                    onClick={() => setActiveTab('heuristics')}
                    className={`flex-1 py-1.5 rounded-md transition-colors ${
                      activeTab === 'heuristics'
                        ? 'bg-slate-800 text-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Linguistic Signals
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="pt-1">
                {activeTab === 'heatmap' && (
                  <TokenHeatmap
                    tokens={classicalResult.tokens}
                    rawText={inputText}
                  />
                )}

                {activeTab === 'waterfall' && (
                  <WaterfallChart
                    topSpamTokens={classicalResult.topSpamTokens}
                    topHamTokens={classicalResult.topHamTokens}
                    logLikelihoodRatio={classicalResult.logLikelihoodRatio}
                  />
                )}

                {activeTab === 'heuristics' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[11px]">Caps Ratio</div>
                        <div className="text-base font-semibold font-mono tabular-nums text-slate-100">
                          {(classicalResult.heuristics.capsRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[11px]">Urgency Triggers</div>
                        <div className="text-base font-semibold font-mono tabular-nums text-slate-100">
                          {classicalResult.heuristics.urgencyKeywordCount}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[11px]">Suspicious URLs</div>
                        <div className="text-base font-semibold font-mono tabular-nums text-slate-100">
                          {classicalResult.heuristics.suspiciousUrls.length}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[11px]">Composite Risk</div>
                        <div
                          className={`text-base font-semibold font-mono tabular-nums ${
                            classicalResult.heuristics.totalLinguisticScore > 50
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {classicalResult.heuristics.totalLinguisticScore}/100
                        </div>
                      </div>
                    </div>

                    {classicalResult.heuristics.detectedUrgencyTokens.length > 0 && (
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          Detected Urgency Phrases:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {classicalResult.heuristics.detectedUrgencyTokens.map((p, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-[11px]"
                            >
                              "{p}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {classicalResult.heuristics.suspiciousUrls.length > 0 && (
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          Suspicious URL Patterns:
                        </span>
                        <ul className="space-y-1 font-mono text-[11px] text-amber-300">
                          {classicalResult.heuristics.suspiciousUrls.map((u, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="break-all">{u}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {classicalResult.heuristics.detectedObfuscations.length > 0 && (
                      <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          Obfuscation / Evasion Patterns:
                        </span>
                        <ul className="space-y-1 font-mono text-[11px] text-purple-300">
                          {classicalResult.heuristics.detectedObfuscations.map((o, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-purple-400 shrink-0" />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Gemini Semantic NLP & Social Engineering Forensics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-100">
                    Semantic NLP & Threat Forensics
                  </h3>
                </div>
                {semanticResult && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      semanticResult.threatLevel === 'HIGH' || semanticResult.threatLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : semanticResult.threatLevel === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {semanticResult.threatLevel} THREAT
                  </span>
                )}
              </div>

              {!semanticResult && !isSemanticLoading && !semanticError && (
                <div className="p-6 text-center space-y-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Deep Semantic Analysis Ready
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                      Click the button below to invoke Gemini 3.8 Flash to uncover subtle social engineering tactics, deceptive intents, and entity risks.
                    </p>
                  </div>
                  <button
                    onClick={handleRunSemanticAnalysis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Run Semantic Scan</span>
                  </button>
                </div>
              )}

              {isSemanticLoading && (
                <div className="p-8 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                  <div className="text-xs text-slate-300 font-medium">
                    Performing Deep Linguistic & Semantic Analysis...
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluating conversational intent, brand impersonation, and psychological coercion markers.
                  </p>
                </div>
              )}

              {semanticError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Semantic Analysis Error</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80">{semanticError}</p>
                </div>
              )}

              {semanticResult && (
                <div className="space-y-4 text-xs">
                  {/* Category & Confidence */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Identified Category
                    </div>
                    <div className="text-sm font-semibold text-cyan-300">
                      {semanticResult.primaryCategory}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                      <span>Semantic Confidence:</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {semanticResult.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                      Forensic Rationale
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {semanticResult.semanticSummary}
                    </p>
                  </div>

                  {/* Social Engineering Vectors */}
                  {semanticResult.socialEngineeringVectors.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                        Social Engineering Attack Vectors
                      </div>
                      <div className="space-y-1.5">
                        {semanticResult.socialEngineeringVectors.map((v, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">
                                {v.vector}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  v.severity === 'HIGH'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : v.severity === 'MEDIUM'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-700/50 text-slate-300'
                                }`}
                              >
                                {v.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              {v.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suspicious Entities */}
                  {semanticResult.suspiciousEntities.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                        Flagged High-Risk Entities
                      </div>
                      <div className="space-y-1.5">
                        {semanticResult.suspiciousEntities.map((ent, i) => (
                          <div
                            key={i}
                            className="p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px] space-y-0.5"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-rose-300 font-semibold break-all">
                                "{ent.entityText}"
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {ent.type}
                              </span>
                            </div>
                            <p className="text-slate-400">{ent.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                      Recommended Security Action
                    </div>
                    <p className="text-slate-200 leading-normal">
                      {semanticResult.recommendedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

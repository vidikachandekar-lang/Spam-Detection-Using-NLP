import React, { useMemo } from 'react';
import { BENCHMARK_SAMPLES } from '../nlp/dataset';
import { classifyNaiveBayes } from '../nlp/naiveBayes';
import {
  Table,
  CheckCircle2,
  AlertCircle,
  Sliders,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface BatchBenchmarkViewProps {
  threshold: number;
  setThreshold: (val: number) => void;
  onSelectSample: (content: string) => void;
}

export const BatchBenchmarkView: React.FC<BatchBenchmarkViewProps> = ({
  threshold,
  setThreshold,
  onSelectSample,
}) => {
  // Evaluate all benchmark samples against current threshold
  const evaluationResults = useMemo(() => {
    return BENCHMARK_SAMPLES.map((sample) => {
      const result = classifyNaiveBayes(sample.content, threshold);
      const predicted: 'SPAM' | 'HAM' = result.isSpam ? 'SPAM' : 'HAM';
      const isCorrect = predicted === sample.groundTruth;

      let matrixBucket: 'TP' | 'FP' | 'TN' | 'FN';
      if (sample.groundTruth === 'SPAM' && predicted === 'SPAM') matrixBucket = 'TP';
      else if (sample.groundTruth === 'HAM' && predicted === 'SPAM') matrixBucket = 'FP';
      else if (sample.groundTruth === 'HAM' && predicted === 'HAM') matrixBucket = 'TN';
      else matrixBucket = 'FN';

      return {
        sample,
        result,
        predicted,
        isCorrect,
        matrixBucket,
      };
    });
  }, [threshold]);

  // Compute Confusion Matrix Counts
  const tp = evaluationResults.filter((r) => r.matrixBucket === 'TP').length;
  const fp = evaluationResults.filter((r) => r.matrixBucket === 'FP').length;
  const tn = evaluationResults.filter((r) => r.matrixBucket === 'TN').length;
  const fn = evaluationResults.filter((r) => r.matrixBucket === 'FN').length;
  const total = evaluationResults.length;

  // Metrics
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Batch Benchmark & Confusion Matrix</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluate the NLP model across 14 diverse spam, phishing, marketing, and legitimate communications.
        </p>
      </div>

      {/* Metrics & Sensitivity Slider */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Model Accuracy</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums mt-1">
            {(accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {tp + tn} of {total} correct predictions
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Precision (Purity)</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums mt-1">
            {(precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            TP / (TP + FP) · Low false alarm rate
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Recall (Coverage)</div>
          <div className="text-2xl font-bold font-mono text-blue-300 tabular-nums mt-1">
            {(recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            TP / (TP + FN) · Spam catch rate
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">F1 Harmonic Score</div>
          <div className="text-2xl font-bold font-mono text-purple-300 tabular-nums mt-1">
            {(f1 * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Balanced precision & recall trade-off
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Threshold Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (7 cols) */}
        <div className="lg:col-span-7 p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200">
              Confusion Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Decision Threshold &tau; = {threshold.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            {/* TP */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1">
              <div className="text-[11px] text-emerald-400 font-sans font-semibold">
                True Positives (TP)
              </div>
              <div className="text-2xl font-bold text-emerald-300 tabular-nums">
                {tp}
              </div>
              <div className="text-[10px] text-slate-400">
                Spam correctly flagged
              </div>
            </div>

            {/* FP */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1">
              <div className="text-[11px] text-rose-400 font-sans font-semibold">
                False Positives (FP)
              </div>
              <div className="text-2xl font-bold text-rose-300 tabular-nums">
                {fp}
              </div>
              <div className="text-[10px] text-slate-400">
                Ham falsely marked as spam
              </div>
            </div>

            {/* FN */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1">
              <div className="text-[11px] text-amber-400 font-sans font-semibold">
                False Negatives (FN)
              </div>
              <div className="text-2xl font-bold text-amber-300 tabular-nums">
                {fn}
              </div>
              <div className="text-[10px] text-slate-400">
                Spam slipped past filter
              </div>
            </div>

            {/* TN */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-1">
              <div className="text-[11px] text-cyan-400 font-sans font-semibold">
                True Negatives (TN)
              </div>
              <div className="text-2xl font-bold text-cyan-300 tabular-nums">
                {tn}
              </div>
              <div className="text-[10px] text-slate-400">
                Legitimate ham delivered
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sensitivity Tuning (5 cols) */}
        <div className="lg:col-span-5 p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Sensitivity & Trade-Off Curve
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Decision Threshold (&tau;):</span>
              <span className="font-mono text-cyan-300 font-semibold tabular-nums">
                {threshold.toFixed(2)} ({(threshold * 100).toFixed(0)}%)
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
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>High Recall (Catch all spam)</span>
              <span>High Precision (Zero false alarms)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1 leading-normal">
            <span className="font-semibold text-slate-200 block">
              Operational Trade-Off:
            </span>
            <p className="text-slate-400">
              In email security, a False Positive (classifying an important customer invoice or password reset as spam) is typically 10&times; more costly than a False Negative. Modern mail services tune &tau; &gt; 0.65 to guarantee high precision.
            </p>
          </div>
        </div>
      </div>

      {/* Row-by-Row Benchmark Evaluation Table */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200">
          Benchmark Dataset Evaluation Detail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Title & Category</th>
                <th className="py-2 px-3">Ground Truth</th>
                <th className="py-2 px-3">Predicted</th>
                <th className="py-2 px-3">P(Spam)</th>
                <th className="py-2 px-3">Outcome</th>
                <th className="py-2 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {evaluationResults.map(({ sample, result, predicted, isCorrect, matrixBucket }) => (
                <tr
                  key={sample.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-200">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sample.category}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span
                      className={
                        sample.groundTruth === 'SPAM'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }
                    >
                      {sample.groundTruth}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span
                      className={
                        predicted === 'SPAM'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }
                    >
                      {predicted}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">
                    {(result.spamProbability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{matrixBucket} (PASS)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>{matrixBucket} (FAIL)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectSample(sample.content)}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <span>Load in Forensics</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

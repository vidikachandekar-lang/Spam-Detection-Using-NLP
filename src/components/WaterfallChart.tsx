import React from 'react';
import { TokenSaliency } from '../nlp/types';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface WaterfallChartProps {
  topSpamTokens: TokenSaliency[];
  topHamTokens: TokenSaliency[];
  logLikelihoodRatio: number;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  topSpamTokens,
  topHamTokens,
  logLikelihoodRatio,
}) => {
  // Max magnitude for scaling bars
  const allOdds = [...topSpamTokens, ...topHamTokens].map((t) => Math.abs(t.logOddsRatio));
  const maxOdds = Math.max(1.0, ...allOdds);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-slate-200">
            Linguistic Feature Attribution (Log-Odds Waterfall)
          </h4>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-400">
          Net Σ Likelihood Ratio:{' '}
          <span
            className={`font-semibold ${
              logLikelihoodRatio > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {logLikelihoodRatio >= 0 ? '+' : ''}
            {logLikelihoodRatio.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spam Evidence (Positive Log-Odds) */}
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-rose-400">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Spam-Pushing Features (+ln P)
            </span>
            <span className="text-[11px] text-slate-400">Weight</span>
          </div>

          {topSpamTokens.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center italic">
              No strong spam tokens detected.
            </div>
          ) : (
            <div className="space-y-1.5">
              {topSpamTokens.map((t, idx) => {
                const percentage = Math.min(100, Math.round((t.logOddsRatio / maxOdds) * 100));
                return (
                  <div key={`${t.stem}-${idx}`} className="text-xs space-y-0.5">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-mono text-[11px] text-slate-200">
                        {t.rawToken}{' '}
                        {t.stem !== t.rawToken.toLowerCase() && (
                          <span className="text-slate-400">({t.stem})</span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-rose-300 font-semibold">
                        +{t.logOddsRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ham Evidence (Negative Log-Odds) */}
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Ham-Pushing Features (-ln P)
            </span>
            <span className="text-[11px] text-slate-400">Weight</span>
          </div>

          {topHamTokens.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center italic">
              No strong ham / conversational tokens detected.
            </div>
          ) : (
            <div className="space-y-1.5">
              {topHamTokens.map((t, idx) => {
                const percentage = Math.min(
                  100,
                  Math.round((Math.abs(t.logOddsRatio) / maxOdds) * 100)
                );
                return (
                  <div key={`${t.stem}-${idx}`} className="text-xs space-y-0.5">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-mono text-[11px] text-slate-200">
                        {t.rawToken}{' '}
                        {t.stem !== t.rawToken.toLowerCase() && (
                          <span className="text-slate-400">({t.stem})</span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-emerald-300 font-semibold">
                        {t.logOddsRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

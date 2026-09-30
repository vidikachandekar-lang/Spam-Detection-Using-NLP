import React, { useState } from 'react';
import { TokenSaliency } from '../nlp/types';
import { Info, X, Zap } from 'lucide-react';

interface TokenHeatmapProps {
  tokens: TokenSaliency[];
  rawText: string;
}

export const TokenHeatmap: React.FC<TokenHeatmapProps> = ({ tokens, rawText }) => {
  const [selectedToken, setSelectedToken] = useState<TokenSaliency | null>(null);

  // Return background color and border based on token saliency
  const getTokenStyle = (t: TokenSaliency) => {
    if (t.isStopword) {
      return 'text-slate-400 opacity-70';
    }

    const s = t.saliencyScore;
    if (s > 0.05) {
      // Spam indicator: red/rose gradient intensity
      if (s > 0.6) {
        return 'bg-rose-500/30 text-rose-200 border-b-2 border-rose-500 font-medium px-1 rounded-sm cursor-pointer hover:bg-rose-500/40';
      }
      if (s > 0.3) {
        return 'bg-rose-500/20 text-rose-300 border-b border-rose-400 px-0.5 rounded-sm cursor-pointer hover:bg-rose-500/30';
      }
      return 'bg-rose-500/10 text-rose-300/90 px-0.5 cursor-pointer hover:bg-rose-500/20';
    } else if (s < -0.05) {
      // Ham indicator: emerald/cyan gradient intensity
      if (s < -0.5) {
        return 'bg-emerald-500/30 text-emerald-200 border-b-2 border-emerald-500 font-medium px-1 rounded-sm cursor-pointer hover:bg-emerald-500/40';
      }
      if (s < -0.2) {
        return 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-400 px-0.5 rounded-sm cursor-pointer hover:bg-emerald-500/30';
      }
      return 'bg-emerald-500/10 text-emerald-300/90 px-0.5 cursor-pointer hover:bg-emerald-500/20';
    }

    return 'text-slate-300 hover:bg-slate-800/60 cursor-pointer rounded px-0.5';
  };

  return (
    <div className="space-y-4">
      {/* Legend & instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300">Token Saliency Map:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Spam Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Ham / Legitimate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
            <span className="text-slate-400">Neutral / Stopword</span>
          </div>
        </div>
        <span className="text-slate-400 text-[11px] italic">
          Click any word to inspect log-odds contribution
        </span>
      </div>

      {/* Rendered Text with Highlighted Tokens */}
      <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 leading-relaxed font-sans text-sm min-h-[140px] max-h-[340px] overflow-y-auto selection:bg-cyan-500/30">
        {tokens.length === 0 ? (
          <span className="text-slate-400 italic">No text provided for analysis.</span>
        ) : (
          <div className="flex flex-wrap gap-x-1 gap-y-1.5 items-baseline">
            {tokens.map((item, idx) => (
              <span
                key={`${item.token}-${idx}`}
                onClick={() => setSelectedToken(item)}
                className={`transition-colors transition-transform inline-block ${getTokenStyle(item)} ${
                  selectedToken?.token === item.token && selectedToken?.stem === item.stem
                    ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 rounded'
                    : ''
                }`}
                title={`Stem: ${item.stem} | Log-Odds: ${item.logOddsRatio.toFixed(2)}`}
              >
                {item.rawToken}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selected Token Inspector Drawer */}
      {selectedToken && (
        <div className="p-3.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-100 text-sm">
                Token Forensics: <span className="font-mono text-cyan-300">"{selectedToken.rawToken}"</span>
              </span>
              {selectedToken.stem !== selectedToken.token && (
                <span className="text-slate-400 font-mono text-[11px]">
                  (stem: <span className="text-slate-300">{selectedToken.stem}</span>)
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedToken(null)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800">
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400">Classification Pull</div>
              <div
                className={`font-semibold text-sm ${
                  selectedToken.logOddsRatio > 0.1
                    ? 'text-rose-400'
                    : selectedToken.logOddsRatio < -0.1
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {selectedToken.logOddsRatio > 0.1
                  ? 'Strong Spam'
                  : selectedToken.logOddsRatio < -0.1
                  ? 'Strong Ham'
                  : 'Neutral / Common'}
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400">Log-Odds Ratio Δ</div>
              <div className="font-mono tabular-nums text-sm font-semibold text-slate-200">
                {selectedToken.logOddsRatio >= 0 ? '+' : ''}
                {selectedToken.logOddsRatio.toFixed(3)}
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400">P(Token | Spam)</div>
              <div className="font-mono tabular-nums text-sm font-semibold text-rose-300">
                {(selectedToken.spamLikelihood * 1000).toFixed(2)}‰
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400">P(Token | Ham)</div>
              <div className="font-mono tabular-nums text-sm font-semibold text-emerald-300">
                {(selectedToken.hamLikelihood * 1000).toFixed(2)}‰
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              Log-Odds equation:{' '}
              <code className="font-mono text-slate-300">
                Δ = ln[ P("{selectedToken.stem}" | Spam) / P("{selectedToken.stem}" | Ham) ]
              </code>
              . A positive value pushes the posterior probability toward Spam; a negative value pushes it toward Ham.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

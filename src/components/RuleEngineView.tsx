import React, { useState } from 'react';
import { ShieldCheck, Code, Zap, AlertTriangle, Check, Plus } from 'lucide-react';

interface RuleDefinition {
  id: string;
  name: string;
  category: 'Urgency' | 'URL / Domain' | 'Obfuscation' | 'Financial';
  pattern: string;
  riskPoints: number;
  description: string;
  examples: string[];
}

const DEFAULT_RULES: RuleDefinition[] = [
  {
    id: 'rule-01',
    name: 'Suspicious High-Risk TLDs',
    category: 'URL / Domain',
    pattern: '\\.(xyz|top|click|club|loan|buzz|live|stream|racing|review)\\b',
    riskPoints: 25,
    description: 'Flags links targeting cheap TLDs commonly registered by spam botnets and phishing kits.',
    examples: ['http://security-update.xyz', 'http://claim-free-coins.click'],
  },
  {
    id: 'rule-02',
    name: 'Brand Squatting in Subdomains',
    category: 'URL / Domain',
    pattern: '(paypal|apple|google|microsoft|netflix|bank)\\-[a-z0-9\\-]+\\.',
    riskPoints: 30,
    description: 'Detects hyphenated domain impersonation attempting to mimic trusted service providers.',
    examples: ['http://paypal-verification-center.com', 'http://apple-support-login.net'],
  },
  {
    id: 'rule-03',
    name: 'Artificial Urgency Demands',
    category: 'Urgency',
    pattern: '(action required|immediate(ly)?|within (24|48|12) hours|account suspended)',
    riskPoints: 20,
    description: 'Identifies artificial scarcity and time pressure designed to bypass critical thinking.',
    examples: ['Action required within 24 hours', 'Your account will be suspended immediately'],
  },
  {
    id: 'rule-04',
    name: 'Cryptocurrency Wallet Addresses',
    category: 'Financial',
    pattern: '\\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\\b|\\b0x[a-fA-F0-9]{40}\\b',
    riskPoints: 20,
    description: 'Matches Bitcoin (P2PKH, P2SH, Bech32) and Ethereum hex addresses.',
    examples: ['bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', '0x71C...b69'],
  },
  {
    id: 'rule-05',
    name: 'Delimited Word Obfuscation',
    category: 'Obfuscation',
    pattern: '\\b([a-zA-Z][\\.\\-_ \\t]){3,}[a-zA-Z]\\b',
    riskPoints: 25,
    description: 'Catches punctuated spam evasion attempts like c.l.i.c.k, f-r-e-e, or p a s s w o r d.',
    examples: ['c.l.i.c.k here', 'f-r-e-e cash'],
  },
  {
    id: 'rule-06',
    name: 'Advance-Fee / Unclaimed Funds Lures',
    category: 'Financial',
    pattern: '(unclaimed (funds|estate|deposit)|next\\-of\\-kin|beneficiary|inheritance)',
    riskPoints: 25,
    description: 'Catches classic 419 advance-fee fraud and lottery jackpot claims.',
    examples: ['unclaimed estate of $18.5 Million', 'next-of-kin transfer'],
  },
];

export const RuleEngineView: React.FC = () => {
  const [testString, setTestString] = useState<string>(
    'Urgent: Immediate action required! Visit http://paypal-security-login.xyz to verify your account or transfer 0.05 BTC to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
  );

  // Evaluate testString against rules
  const ruleMatches = DEFAULT_RULES.map((rule) => {
    try {
      const reg = new RegExp(rule.pattern, 'i');
      const isMatch = reg.test(testString);
      const matchDetails = testString.match(reg);
      return {
        rule,
        isMatch,
        matchedText: matchDetails ? matchDetails[0] : null,
      };
    } catch {
      return { rule, isMatch: false, matchedText: null };
    }
  });

  const totalTriggeredRisk = ruleMatches
    .filter((m) => m.isMatch)
    .reduce((sum, m) => sum + m.rule.riskPoints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Heuristic & Pattern Rule Engine</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect deterministic NLP regex rules that operate alongside the Bayesian classifier to catch known spam evasion and fraud patterns.
        </p>
      </div>

      {/* Interactive Rule Tester */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200">
            Live Pattern Matcher Sandbox
          </h3>
          <span className="text-xs font-mono tabular-nums text-slate-300">
            Heuristic Score:{' '}
            <strong
              className={`font-semibold ${
                totalTriggeredRisk > 40 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {totalTriggeredRisk} pts
            </strong>
          </span>
        </div>

        <input
          type="text"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Type a sample sentence or URL to test against active rules..."
          className="w-full p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />

        <div className="flex flex-wrap gap-2 text-[11px] pt-1">
          <span className="text-slate-400">Triggered Rules:</span>
          {ruleMatches.filter((m) => m.isMatch).length === 0 ? (
            <span className="text-slate-400 italic">No rules matched.</span>
          ) : (
            ruleMatches
              .filter((m) => m.isMatch)
              .map((m) => (
                <span
                  key={m.rule.id}
                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium font-mono"
                >
                  {m.rule.name} (+{m.rule.riskPoints} pts)
                </span>
              ))
          )}
        </div>
      </div>

      {/* Rules Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleMatches.map(({ rule, isMatch, matchedText }) => (
          <div
            key={rule.id}
            className={`p-4 rounded-xl border transition-all ${
              isMatch
                ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                {rule.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                +{rule.riskPoints} pts
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">{rule.description}</p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] text-cyan-300 overflow-x-auto">
                <span className="text-slate-400 select-none">REGEX: </span>
                {rule.pattern}
              </div>

              {isMatch && matchedText && (
                <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded text-[11px] text-rose-300">
                  <span className="font-sans font-semibold">Matched Substring: </span>
                  <span className="font-mono">"{matchedText}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

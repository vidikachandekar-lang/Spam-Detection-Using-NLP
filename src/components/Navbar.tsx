import React from 'react';
import { ShieldAlert, Cpu, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'classifier' | 'pipeline' | 'adversarial' | 'benchmark' | 'rules';
  setActiveTab: (tab: 'classifier' | 'pipeline' | 'adversarial' | 'benchmark' | 'rules') => void;
  onReset: () => void;
  onLoadSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  onLoadSample,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-cyan-500/20">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            VigilNLP
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">
              / Spam Forensics & Classifier
            </span>
          </span>
        </div>

        {/* Zone 2: Navigation tabs with segmented styling */}
        <nav className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'classifier'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classifier & Forensics
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NLP Pipeline
          </button>
          <button
            onClick={() => setActiveTab('adversarial')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'adversarial'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Adversarial Lab
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmark & Matrix
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pattern Rules
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Phishing Lure</span>
          </button>
          <button
            onClick={onReset}
            title="Reset text input"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

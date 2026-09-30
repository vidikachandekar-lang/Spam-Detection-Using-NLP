import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ClassifierView } from './components/ClassifierView';
import { PipelineStepViewer } from './components/PipelineStepViewer';
import { AdversarialLab } from './components/AdversarialLab';
import { BatchBenchmarkView } from './components/BatchBenchmarkView';
import { RuleEngineView } from './components/RuleEngineView';
import { BENCHMARK_SAMPLES } from './nlp/dataset';
import { classifyNaiveBayes } from './nlp/naiveBayes';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'classifier' | 'pipeline' | 'adversarial' | 'benchmark' | 'rules'
  >('classifier');

  // Initial text: PayPal restriction phishing alert
  const defaultSample = BENCHMARK_SAMPLES[0];
  const [inputText, setInputText] = useState<string>(defaultSample.content);
  const [threshold, setThreshold] = useState<number>(0.5);

  const handleReset = () => {
    setInputText('');
  };

  const handleLoadSample = () => {
    setInputText(defaultSample.content);
    setActiveTab('classifier');
  };

  const handleSelectSampleFromBenchmark = (content: string) => {
    setInputText(content);
    setActiveTab('classifier');
  };

  // Compute classical NLP result for sharing with Pipeline inspector
  const classicalResult = inputText.trim()
    ? classifyNaiveBayes(inputText, threshold)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'classifier' && (
          <ClassifierView
            inputText={inputText}
            setInputText={setInputText}
            threshold={threshold}
            setThreshold={setThreshold}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineStepViewer rawText={inputText} result={classicalResult} />
        )}

        {activeTab === 'adversarial' && (
          <AdversarialLab baseText={inputText} />
        )}

        {activeTab === 'benchmark' && (
          <BatchBenchmarkView
            threshold={threshold}
            setThreshold={setThreshold}
            onSelectSample={handleSelectSampleFromBenchmark}
          />
        )}

        {activeTab === 'rules' && <RuleEngineView />}
      </main>

      {/* Clean Architectural Footer (quiet, no telemetry clutter) */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">VigilNLP Engine</span>
            <span aria-hidden="true">·</span>
            <span>Multinomial Naive Bayes & Laplace Smoothing</span>
            <span aria-hidden="true">·</span>
            <span>Gemini Semantic Threat Forensics</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Natural Language Processing Suite</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Pill Typography</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

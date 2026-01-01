
import React, { useState, useEffect } from 'react';
import { PenTool, Layers, BookOpen, Settings, ChevronRight, Check } from 'lucide-react';

// New Architecture Components
import Step1Research from './components/steps/Step1Research';
import Step2Architect from './components/steps/Step2Architect';
import Step3Writer from './components/steps/Step3Writer';

import { BlogInput, Platform, TargetAudience, StyleCard } from './types';
import { analyzeStyle } from './services/geminiService';

const BRAND_GUIDE_FILENAME = 'brand_guide.txt';
const STYLE_GUIDE_FILENAME = 'writing_style_guide.txt';
const KB_FILENAME = 'knowledge_base.txt';

function App() {
  const [step, setStep] = useState(1);
  const [blogInput, setBlogInput] = useState<BlogInput>({
    platform: 'Naver',
    targetAudience: 'Parent',
    topic: '',
    selectedKeyword: '',
    selectedTopic: '',
    selectedFlow: '',
    libraryFiles: [],
    searchPeriod: 'month',
    customSearchPeriod: '',
    analysisFocus: 'micro',
    useKnowledgeBase: true,
  });

  // Global Context State
  const [brandLibrary, setBrandLibrary] = useState("");
  const [manualGuide, setManualGuide] = useState("");
  const [knowledgeBaseText, setKnowledgeBaseText] = useState("");
  const [styleCard, setStyleCard] = useState<StyleCard | undefined>(undefined);

  // Load Guides on Mount
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const [brandRes, manualRes, kbRes] = await Promise.all([
          fetch(`/docs/${BRAND_GUIDE_FILENAME}`),
          fetch(`/docs/${STYLE_GUIDE_FILENAME}`),
          fetch(`/docs/${KB_FILENAME}`)
        ]);

        setBrandLibrary(await brandRes.text());
        setManualGuide(await manualRes.text());
        setKnowledgeBaseText(await kbRes.text());
        console.log("Guides Loaded");
      } catch (e) {
        console.error("Failed to load guides", e);
      }
    };
    loadDocs();
  }, []);

  // -- Handlers --
  const handleStrategyComplete = () => setStep(2);
  const handleArchitectComplete = () => setStep(3);

  const steps = [
    { num: 1, title: 'Deep Research', icon: <BookOpen className="w-5 h-5" /> },
    { num: 2, title: 'The Architect', icon: <Layers className="w-5 h-5" /> },
    { num: 3, title: 'The Writer', icon: <PenTool className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">

      {/* Sidebar (Simplified) */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">✨</span> MyStyle AI
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">V3.5 Deep Research Edition</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              disabled={s.num > step}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${step === s.num
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100 font-bold'
                  : step > s.num
                    ? 'text-gray-400 bg-gray-50'
                    : 'text-gray-300'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${step === s.num ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100'
                }`}>
                {step > s.num ? <Check className="w-5 h-5 text-green-500" /> : <span className="text-sm">{s.num}</span>}
              </div>
              <div className="text-left">
                <div className="text-sm">{s.title}</div>
                {step === s.num && <div className="text-[10px] text-indigo-400 animate-pulse">In Progress...</div>}
              </div>
            </button>
          ))}
        </nav>

        {/* Status Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <div className={`w-2 h-2 rounded-full ${brandLibrary ? 'bg-green-500' : 'bg-red-500'}`} />
            Brand Guide: {brandLibrary ? 'Ready' : 'Missing'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2 h-2 rounded-full ${manualGuide ? 'bg-green-500' : 'bg-red-500'}`} />
            Style Guide: {manualGuide ? 'Ready' : 'Missing'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10 glass-effect">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{blogInput.targetAudience} Mode</span>
            <ChevronRight className="w-4 h-4" />
            <span>{blogInput.platform}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Platform Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['Naver', 'Google'] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setBlogInput(prev => ({ ...prev, platform: p }))}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${blogInput.platform === p ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Target Audience Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['Parent', 'Student'] as TargetAudience[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBlogInput(prev => ({ ...prev, targetAudience: t }))}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${blogInput.targetAudience === t ? 'bg-white shadow text-pink-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {t === 'Parent' ? 'Parent (학부모)' : 'Student (학생)'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
          <div className="animate-fade-in-up">
            {step === 1 && (
              <Step1Research
                blogInput={blogInput}
                setBlogInput={setBlogInput}
                onNext={handleStrategyComplete}
                knowledgeBaseText={knowledgeBaseText}
              />
            )}

            {step === 2 && (
              <Step2Architect
                blogInput={blogInput}
                setBlogInput={setBlogInput}
                onNext={handleArchitectComplete}
                styles={{ styleGuide: manualGuide, brandGuide: brandLibrary }}
              />
            )}

            {step === 3 && (
              <Step3Writer
                blogInput={blogInput}
                styles={{ styleGuide: manualGuide, brandGuide: brandLibrary, styleCard }}
                knowledgeBaseText={knowledgeBaseText}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

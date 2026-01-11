import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle, Loader2, BookOpen, Globe, Trash2, Plus, Edit2, X, Save, FileText, Clipboard } from 'lucide-react';
import { BlogInput, InsightCard } from '../../types';
import { runDeepResearch, analyzeManualReport } from '../../services/geminiService';

interface Props {
    blogInput: BlogInput;
    setBlogInput: React.Dispatch<React.SetStateAction<BlogInput>>;
    onNext: () => void;
    knowledgeBaseText: string;
}

export default function Step1Research({ blogInput, setBlogInput, onNext, knowledgeBaseText }: Props) {
    const [mode, setMode] = useState<'Auto' | 'Manual'>('Auto');

    // Auto Mode State
    const [topic, setTopic] = useState(blogInput.topic || "");

    // Manual Mode State
    const [manualText, setManualText] = useState(blogInput.manualResearchText || "");

    const [isExamining, setIsExamining] = useState(false);
    const [insight, setInsight] = useState<InsightCard | null>(blogInput.insightCard || null);
    const [error, setError] = useState<string | null>(null);

    // Editing State
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [newFact, setNewFact] = useState("");

    const handleResearch = async () => {
        setIsExamining(true);
        setError(null);
        setInsight(null);
        setEditingIndex(null);

        try {
            let result: InsightCard;

            if (mode === 'Auto') {
                if (!topic.trim()) return;
                result = await runDeepResearch(topic, true, knowledgeBaseText);
            } else {
                if (!manualText.trim()) return;
                result = await analyzeManualReport(manualText);
            }

            setInsight(result);
            setBlogInput(prev => ({
                ...prev,
                topic: topic,
                manualResearchText: manualText,
                insightCard: result,
                researchMode: mode
            }));

        } catch (e: any) {
            setError(e.message || "리서치 분석 중 오류가 발생했습니다.");
        } finally {
            setIsExamining(false);
        }
    };

    // -- Fact Editing Helpers --
    const updateGlobalInsight = (newInsight: InsightCard) => {
        setInsight(newInsight);
        setBlogInput(prev => ({ ...prev, insightCard: newInsight }));
    };

    const handleDeleteFact = (index: number) => {
        if (!insight) return;
        const newFacts = insight.facts.filter((_, i) => i !== index);
        updateGlobalInsight({ ...insight, facts: newFacts });
    };

    const handleAddFact = () => {
        if (!insight || !newFact.trim()) return;
        const newFacts = [...insight.facts, newFact.trim()];
        updateGlobalInsight({ ...insight, facts: newFacts });
        setNewFact("");
    };

    const startEditing = (index: number, currentText: string) => {
        setEditingIndex(index);
        setEditValue(currentText);
    };

    const saveEdit = (index: number) => {
        if (!insight) return;
        const newFacts = [...insight.facts];
        newFacts[index] = editValue.trim();
        updateGlobalInsight({ ...insight, facts: newFacts });
        setEditingIndex(null);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Step 1. Research & Analysis</h2>

                {/* Mode Toggles */}
                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('Auto')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'Auto' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🤖 Auto Deep Research
                    </button>
                    <button
                        onClick={() => setMode('Manual')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'Manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📋 Paste Manual Report
                    </button>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                {mode === 'Auto' ? (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Topic Keyword</label>
                        <div className="flex gap-2">
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="예: Digital SAT Inference Strategy"
                                className="flex-1 p-4 border border-gray-200 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            />
                            <button
                                onClick={handleResearch}
                                disabled={!topic.trim() || isExamining}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold flex items-center gap-2"
                            >
                                {isExamining ? <Loader2 className="animate-spin" /> : <Search />}
                                Auto Research
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex justify-between">
                            <span>Deep Research Report (Paste here)</span>
                            <span className="text-xs text-gray-400 font-normal">Google Deep Research나 직접 정리한 리포트를 붙여넣으세요.</span>
                        </label>
                        <textarea
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder="[리서치 리포트 원문]&#13;&#13;1. 핵심 발견...&#13;2. 주요 통계...&#13;3. 결론..."
                            className="w-full h-64 p-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleResearch}
                                disabled={!manualText.trim() || isExamining}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold flex items-center gap-2"
                            >
                                {isExamining ? <Loader2 className="animate-spin" /> : <Clipboard />}
                                Analyze & Extract Facts
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            {/* Insight Card Result */}
            {insight && (
                <div className="bg-white border-2 border-indigo-100 rounded-xl overflow-hidden shadow-lg animate-fade-in-up">
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            Insight Card (확보된 재료)
                        </h3>
                        <span className="text-xs font-mono text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-200">
                            {insight.facts.length} Facts / {insight.sources.length} Sources
                        </span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Facts (Edit Allowed)</h4>
                            </div>

                            <ul className="space-y-3">
                                {insight.facts.map((fact, i) => (
                                    <li key={i} className={`flex gap-3 items-start p-3 rounded-lg transition-colors ${editingIndex === i ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-gray-50 hover:bg-gray-100 group'}`}>
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full mt-0.5">
                                            {i + 1}
                                        </span>

                                        {editingIndex === i ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="flex-1 p-2 border border-indigo-300 rounded text-sm focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(i);
                                                        if (e.key === 'Escape') setEditingIndex(null);
                                                    }}
                                                />
                                                <button onClick={() => saveEdit(i)} className="p-1 text-green-600"><Save className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex justify-between items-start gap-2">
                                                <p className="text-gray-700 leading-relaxed text-sm pt-0.5">{fact}</p>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditing(i, fact)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteFact(i)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2 pt-2">
                                <input
                                    value={newFact}
                                    onChange={(e) => setNewFact(e.target.value)}
                                    placeholder="+ Add a manual fact"
                                    className="flex-1 p-3 border border-dashed border-gray-300 rounded-lg text-sm outline-none bg-gray-50 hover:bg-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                                />
                                <button onClick={handleAddFact} disabled={!newFact.trim()} className="px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {insight.sources.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sources</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {insight.sources.map((src, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 text-xs text-gray-600 truncate">
                                            {src.type === 'Web' ? <Globe className="w-3 h-3 text-blue-400" /> : <FileText className="w-3 h-3 text-green-400" />}
                                            <a href={src.url || "#"} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-blue-500 block flex-1">
                                                {src.title}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Confirm & Build Brief <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

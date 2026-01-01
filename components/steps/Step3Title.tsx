import React, { useState } from 'react';
import { Loader2, Edit2, Check, X, ArrowRight } from 'lucide-react';
import { BlogInput, TopicSuggestion } from '../../types';

interface Step3Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    topics: TopicSuggestion[];
    setTopics: React.Dispatch<React.SetStateAction<TopicSuggestion[]>>;
    setCurrentStep: (step: number) => void;
    handleNextStep: () => void;
    isLoading: boolean;
    error?: string | null;
}

const Step3Title: React.FC<Step3Props> = ({ blogInput, setBlogInput, topics, setTopics, setCurrentStep, handleNextStep, isLoading, error }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ title: string; hook: string }>({ title: '', hook: '' });

    const startEditing = (index: number, topic: TopicSuggestion) => {
        setEditingIndex(index);
        setEditValues({ title: topic.title, hook: topic.hook });
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditValues({ title: '', hook: '' });
    };

    const saveEditing = (index: number) => {
        const newTopics = [...topics];
        newTopics[index] = { ...newTopics[index], title: editValues.title, hook: editValues.hook };
        setTopics(newTopics);

        // If the edited one was selected, update selection too
        if (blogInput.selectedTopic === topics[index].title) {
            setBlogInput({ ...blogInput, selectedTopic: editValues.title, selectedFlow: editValues.hook });
        }

        setEditingIndex(null);
    };

    const handleSelect = (tp: TopicSuggestion) => {
        if (editingIndex !== null) return; // Prevent selection while editing
        setBlogInput({ ...blogInput, selectedTopic: tp.title, selectedFlow: tp.hook });
    };

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-4xl font-black text-slate-900">Step 3. 제목 & 전개 제안</h2>
                <p className="text-slate-500 font-medium mt-2">브랜드 보이스에 맞춰 제안된 제목 중 하나를 선택하거나, 직접 수정하세요.</p>
            </header>

            <div className="space-y-6">
                {topics.map((tp, i) => (
                    <div key={i} className={`relative rounded-[3rem] border-4 transition-all group ${blogInput.selectedTopic === tp.title ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                        {editingIndex === i ? (
                            <div className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-indigo-500">제목 수정</label>
                                    <input
                                        type="text"
                                        value={editValues.title}
                                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                        className="w-full p-4 bg-white border border-indigo-200 rounded-2xl font-black text-xl md:text-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-indigo-500">Logic Flow 수정 (화살표 '{"->"}' 유지 권장)</label>
                                    <textarea
                                        value={editValues.hook}
                                        onChange={(e) => setEditValues({ ...editValues, hook: e.target.value })}
                                        className="w-full p-4 h-32 bg-white border border-indigo-200 rounded-2xl font-medium text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={cancelEditing} className="px-6 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold hover:bg-slate-300">취소</button>
                                    <button onClick={() => saveEditing(i)} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2">
                                        <Check size={16} /> 저장 완료
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => handleSelect(tp)} className="w-full p-10 cursor-pointer flex justify-between items-start text-left">
                                <div className="space-y-5 flex-1 pr-12">
                                    <div className="flex items-center gap-2">
                                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-indigo-100 text-indigo-600">{tp.type}</span>
                                        {blogInput.selectedTopic === tp.title && <span className="text-indigo-600 flex items-center gap-1 text-[10px] font-black uppercase"><Check size={12} /> Selected</span>}
                                    </div>
                                    <h4 className="font-black text-2xl md:text-3xl leading-tight text-slate-900 group-hover:text-indigo-800 transition-colors">{tp.title}</h4>
                                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Logic Flow Architecture</span>
                                        <div className="space-y-2">
                                            {(tp.hook || "내용 없음").split(/->|\n/).map((step, idx) => (
                                                <div key={idx} className="flex items-start gap-3 text-xs">
                                                    <span className="min-w-[4rem] font-bold text-indigo-400 uppercase pt-0.5">{
                                                        idx === 0 ? "1. Intro" : idx === 1 ? "2. Body" : idx === 2 ? "3. Outro" : `${idx + 1}. Step`
                                                    }</span>
                                                    <p className="text-slate-600 font-medium leading-relaxed">{step.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); startEditing(i, tp); }}
                                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm z-10"
                                    title="수정하기"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100 animate-pulse">
                    ⚠️ {error}
                </div>
            )}
            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(2)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg text-slate-600 hover:bg-slate-50">이전</button>
                <button onClick={handleNextStep} disabled={!blogInput.selectedTopic || isLoading} className="flex-[2] py-7 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                    {isLoading ? <Loader2 className="animate-spin" /> : "목차 생성 (Next)"} <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Step3Title;


import React, { useState, useEffect } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { BlogInput, KeySentence } from '../../types';

interface Step5Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    keySentences: KeySentence[];
    setCurrentStep: (step: number) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const Step5KeySentences: React.FC<Step5Props> = ({ blogInput, setBlogInput, keySentences, setCurrentStep, onGenerate, isLoading }) => {
    // Local state to handle editing
    const [sentences, setSentences] = useState<KeySentence[]>([]);

    useEffect(() => {
        if (keySentences && keySentences.length > 0) {
            setSentences(keySentences);
        }
    }, [keySentences]);

    const handleSentenceChange = (index: number, newText: string) => {
        const updated = [...sentences];
        updated[index] = { ...updated[index], keySentence: newText };
        setSentences(updated);

        // Update global state immediately or on next? 
        // For simplicity, we can update it here or just wait for 'Next'
        setBlogInput({ ...blogInput, keySentences: updated });
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <header>
                <h2 className="text-4xl font-black text-slate-900">Step 5. 핵심 문장(뼈대) 검수</h2>
                <p className="text-slate-500 font-medium mt-2">각 섹션의 핵심 메시지입니다. 이 문장을 수정하면 최종 글의 방향이 바뀝니다.</p>

                {/* Outline Reference */}
                <div className="mt-8 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-3">Current Outline</h3>
                    <div className="flex flex-wrap gap-2">
                        {blogInput.customSections.map((sec, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-50 shadow-sm">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">{idx + 1}</span>
                                {sec}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {sentences.length === 0 ? (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
                        <p className="text-lg font-bold text-slate-400">데이터 기반 핵심 문장 추출 중...</p>
                    </div>
                ) : (
                    sentences.map((sent, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">{sent.sectionId}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section Key Message</span>
                            </div>
                            <textarea
                                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-lg text-slate-800 focus:bg-white focus:border-indigo-600 transition-all resize-none"
                                value={sent.keySentence}
                                onChange={(e) => handleSentenceChange(i, e.target.value)}
                            />
                        </div>
                    ))
                )}
            </div>

            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(4)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg">이전</button>
                <button onClick={onGenerate} disabled={sentences.length === 0 || isLoading} className="flex-[2] py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-3">
                    {isLoading ? <Loader2 className="animate-spin" /> : <> <Zap size={24} fill="currentColor" /> 최종 집필 시작 </>}
                </button>
            </div>
        </div >
    );
};

export default Step5KeySentences;

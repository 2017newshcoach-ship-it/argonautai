
import React from 'react';
import { TrendingUp, Target, Loader2, Info } from 'lucide-react';
import { BlogInput, KeywordSuggestion } from '../../types';

interface Step2Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    keywords: KeywordSuggestion[];
    setCurrentStep: (step: number) => void;
    handleNextStep: () => void;
    isLoading: boolean;
    error: string | null;
}

const Step2Keyword: React.FC<Step2Props> = ({ blogInput, setBlogInput, keywords, setCurrentStep, handleNextStep, isLoading, error }) => {
    return (
        <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900">Step 2. 키워드 전략</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keywords.map((kw, i) => (
                    <button key={i} onClick={() => setBlogInput({ ...blogInput, selectedKeyword: kw.keyword })} className={`p-8 rounded-[3rem] border-4 transition-all text-left space-y-4 relative overflow-hidden group ${blogInput.selectedKeyword === kw.keyword ? 'border-indigo-600 bg-indigo-50/50 shadow-xl' : 'bg-white border-slate-100'}`}>
                        <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 ${kw.searchVolume?.includes('High') ? 'bg-rose-100 text-rose-600' :
                            kw.searchVolume?.includes('Medium') ? 'bg-amber-100 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                            }`}>
                            {kw.searchVolume?.includes('High') ? <TrendingUp size={12} /> : <Target size={12} />}
                            {kw.searchVolume || 'Check Vol'}
                        </div>

                        <h4 className="font-black text-2xl pr-20">#{kw.keyword}</h4>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{kw.reason}</p>

                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${kw.competition === 'High' ? 'bg-red-50 text-red-500' :
                                kw.competition === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-emerald-50 text-emerald-600'
                                }`}>Comp: {kw.competition}</span>
                        </div>
                    </button>
                ))}
            </div>
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                    <Info size={16} /> {error}
                </div>
            )}
            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(1)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg">이전</button>
                <button onClick={handleNextStep} disabled={!blogInput.selectedKeyword || isLoading} className="flex-[2] py-7 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3">
                    {isLoading ? <Loader2 className="animate-spin" /> : "세부 주제 추천"}
                </button>
            </div>
        </div>
    );
};

export default Step2Keyword;


import React from 'react';
import { Loader2 } from 'lucide-react';
import { BlogInput, TopicSuggestion } from '../../types';

interface Step3Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    topics: TopicSuggestion[];
    setCurrentStep: (step: number) => void;
    handleNextStep: () => void;
    isLoading: boolean;
}

const Step3Topic: React.FC<Step3Props> = ({ blogInput, setBlogInput, topics, setCurrentStep, handleNextStep, isLoading }) => {
    return (
        <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900">Step 3. 로컬 DB 기반 세부 주제</h2>
            <div className="space-y-6">
                {topics.map((tp, i) => (
                    <button key={i} onClick={() => setBlogInput({ ...blogInput, selectedTopic: tp.title })} className={`w-full p-10 rounded-[3rem] border-4 transition-all text-left flex justify-between items-center group ${blogInput.selectedTopic === tp.title ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                        <div className="space-y-5 flex-1">
                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-indigo-100 text-indigo-600">{tp.type}</span>
                            <h4 className="font-black text-2xl md:text-3xl leading-tight">{tp.title}</h4>
                            <p className="text-slate-500 font-medium italic">" {tp.hook} "</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(2)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg">이전</button>
                <button onClick={handleNextStep} disabled={!blogInput.selectedTopic} className="flex-[2] py-7 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl">{isLoading ? "데이터 정밀 분석 중..." : "데이터 정밀 분석"}</button>
            </div>
        </div>
    );
};

export default Step3Topic;

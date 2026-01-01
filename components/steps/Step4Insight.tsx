
import React from 'react';
import { Loader2 } from 'lucide-react';
import { BlogInput, InsightOption } from '../../types';

interface Step4Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    insights: InsightOption[];
    setCurrentStep: (step: number) => void;
    handleNextStep: () => void;
    isLoading: boolean;
}

const Step4Insight: React.FC<Step4Props> = ({ blogInput, setBlogInput, insights, setCurrentStep, handleNextStep }) => {
    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-4xl font-black text-slate-900">Step 4. 미시 통찰 & 근거</h2>
                <p className="text-slate-500 font-medium mt-2">AI가 DB를 분석하여 발견한 독창적 관점(Angle) 중 하나를 선택하거나 직접 수정하세요.</p>
            </header>

            {insights.length === 0 ? (
                <div className="text-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
                    <p className="text-lg font-bold text-slate-400">데이터 기반 통찰을 분석 중입니다...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {insights.map((insight) => (
                        <button
                            key={insight.id}
                            onClick={() => setBlogInput({ ...blogInput, uniqueInsight: insight.angle, recentContext: insight.context })}
                            className={`p-8 rounded-[2.5rem] border-4 transition-all text-left group hover:border-indigo-300 ${blogInput.uniqueInsight === insight.angle ? 'border-indigo-600 bg-indigo-50/50 shadow-xl' : 'bg-white border-slate-100'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-xl text-white font-black text-xs ${blogInput.uniqueInsight === insight.angle ? 'bg-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                    {insight.id}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-black text-xl text-slate-900">{insight.angle}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{insight.description}</p>
                                    <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg font-bold inline-block">
                                        💡 배경 맥락: {insight.context.substring(0, 60)}...
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="relative group">
                <div className="absolute -top-3 left-8 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Insight (Editable)</div>
                <textarea
                    className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-medium text-slate-700 focus:bg-white focus:border-indigo-600 transition-all shadow-inner resize-none"
                    value={blogInput.uniqueInsight}
                    onChange={e => setBlogInput({ ...blogInput, uniqueInsight: e.target.value })}
                    placeholder="위에서 AI가 제안한 통찰을 선택하면 여기에 입력됩니다. 필요시 수정하세요."
                />
            </div>

            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(3)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg">이전</button>
                <button onClick={handleNextStep} disabled={!blogInput.uniqueInsight} className="flex-[2] py-7 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl">목차 설계</button>
            </div>
        </div>
    );
};

export default Step4Insight;

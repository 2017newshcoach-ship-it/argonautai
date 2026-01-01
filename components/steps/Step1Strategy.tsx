
import React from 'react';
import { Globe, MessageSquare, Eye, Microscope, Info, Loader2 } from 'lucide-react';
import { BlogInput } from '../../types';

interface Step1Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    handleNextStep: () => void;
    isLoading: boolean;
    error: string | null;
}

const Step1Strategy: React.FC<Step1Props> = ({ blogInput, setBlogInput, handleNextStep, isLoading, error }) => {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <header><h2 className="text-4xl font-black tracking-tight text-slate-900">Step 1. 전략 설정</h2></header>
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Platform</label>
                        <div className="p-2 bg-slate-100 rounded-[2.5rem] flex relative">
                            <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white rounded-[2rem] shadow-sm transition-all duration-300 ${blogInput.platform === 'Google' ? 'left-2' : 'left-[calc(50%+4px)]'}`} />
                            <button onClick={() => setBlogInput({ ...blogInput, platform: 'Google' })} className={`flex-1 relative z-10 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-2 ${blogInput.platform === 'Google' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                <Globe size={16} /> GOOGLE <span className="text-[9px] opacity-60 font-medium hidden sm:inline">(Info/Global)</span>
                            </button>
                            <button onClick={() => setBlogInput({ ...blogInput, platform: 'Naver' })} className={`flex-1 relative z-10 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-2 ${blogInput.platform === 'Naver' ? 'text-green-600' : 'text-slate-400'}`}>
                                <MessageSquare size={16} /> NAVER <span className="text-[9px] opacity-60 font-medium hidden sm:inline">(Exp/Local)</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Target Mode</label>
                        <div className="p-2 bg-slate-100 rounded-[2.5rem] flex relative">
                            <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white rounded-[2rem] shadow-sm transition-all duration-300 ${blogInput.targetAudience === 'Parent' ? 'left-2' : 'left-[calc(50%+4px)]'}`} />
                            <button onClick={() => setBlogInput({ ...blogInput, targetAudience: 'Parent' })} className={`flex-1 relative z-10 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-2 ${blogInput.targetAudience === 'Parent' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                <Eye size={16} /> Parent <span className="text-[9px] opacity-60 font-medium hidden sm:inline">(Mode P)</span>
                            </button>
                            <button onClick={() => setBlogInput({ ...blogInput, targetAudience: 'Student' })} className={`flex-1 relative z-10 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-2 ${blogInput.targetAudience === 'Student' ? 'text-rose-600' : 'text-slate-400'}`}>
                                <Microscope size={16} /> Student <span className="text-[9px] opacity-60 font-medium hidden sm:inline">(Mode S)</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:col-span-2">
                        <button onClick={() => setBlogInput({ ...blogInput, analysisFocus: 'broad' })} className={`p-4 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all ${blogInput.analysisFocus === 'broad' ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-100 bg-white text-slate-400'}`}>
                            <Eye size={20} /> <span className="font-black text-xs">거시적 분석</span>
                        </button>
                        <button onClick={() => setBlogInput({ ...blogInput, analysisFocus: 'micro' })} className={`p-4 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all ${blogInput.analysisFocus === 'micro' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-slate-100 bg-white text-slate-400'}`}>
                            <Microscope size={20} /> <span className="font-black text-xs">현미경 분석</span>
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <input
                        className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-3xl placeholder:text-slate-300 focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                        placeholder="분석할 대주제를 입력하세요."
                        value={blogInput.topic}
                        onChange={e => setBlogInput({ ...blogInput, topic: e.target.value })}
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                        <Info size={16} /> {error}
                    </div>
                )}

                <button onClick={handleNextStep} disabled={!blogInput.topic || isLoading} className="w-full py-8 bg-slate-950 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-900 transition-all">
                    {isLoading ? <Loader2 className="animate-spin" /> : "DB 기반 인텔리전스 가동"}
                </button>
            </div>
        </div>
    );
};

export default Step1Strategy;

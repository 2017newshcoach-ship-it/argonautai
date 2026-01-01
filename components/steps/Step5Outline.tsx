
import React from 'react';
import { BlogInput, OutlineOption } from '../../types';
import { Trash2 } from 'lucide-react';

interface Step5Props {
    blogInput: BlogInput;
    setBlogInput: (input: BlogInput) => void;
    outlines: OutlineOption[];
    setCurrentStep: (step: number) => void;
    onGenerate: () => void;
    isLoading: boolean;
    error?: string | null;
}

const Step5Outline: React.FC<Step5Props> = ({ blogInput, setBlogInput, outlines, setCurrentStep, onGenerate, isLoading, error }) => {

    const selectOutline = (ol: OutlineOption) => {
        setBlogInput({ ...blogInput, selectedOutlineId: ol.id, customSections: [...ol.sections] });
    };

    const handleSectionChange = (index: number, value: string) => {
        const newSections = [...blogInput.customSections];
        newSections[index] = value;
        setBlogInput({ ...blogInput, customSections: newSections });
    };

    const addSection = () => {
        setBlogInput({ ...blogInput, customSections: [...blogInput.customSections, "새로운 소제목"] });
    };

    const removeSection = (index: number) => {
        const newSections = blogInput.customSections.filter((_, i) => i !== index);
        setBlogInput({ ...blogInput, customSections: newSections });
    };

    return (
        <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900">Step 5. 목차 확정</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {outlines.map((ol) => (
                    <button key={ol.id} onClick={() => selectOutline(ol)} className={`w-full p-8 rounded-[2.5rem] border-4 transition-all text-left ${blogInput.selectedOutlineId === ol.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-50'}`}>
                        <h4 className="font-black text-lg mb-4 text-slate-900">{ol.label}</h4>
                        <div className="space-y-2">
                            {ol.sections.map((sec, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                                    <span className="min-w-[1.2rem] h-[1.2rem] rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 mt-0.5">{idx + 1}</span>
                                    <p className="leading-relaxed">{sec}</p>
                                </div>
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            {/* Editable Area */}
            {blogInput.selectedOutlineId && (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Edit Layout</label>
                        <button onClick={addSection} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all text-slate-600">+ Add Section</button>
                    </div>
                    <div className="space-y-3">
                        {blogInput.customSections.map((sec, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                <input
                                    className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                    value={sec}
                                    onChange={(e) => handleSectionChange(idx, e.target.value)}
                                />
                                <button onClick={() => removeSection(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100 animate-pulse">
                    ⚠️ {error}
                </div>
            )}
            <div className="flex gap-6">
                <button onClick={() => setCurrentStep(4)} className="flex-1 py-7 bg-white border border-slate-200 rounded-[2rem] font-black text-lg">이전</button>
                <button onClick={onGenerate} disabled={blogInput.customSections.length === 0 || isLoading} className="flex-[2] py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl">
                    {isLoading ? "DB 데이터 기반 집필 중..." : "최종 분석 포스팅 발행"}
                </button>
            </div>
        </div>
    );
};

export default Step5Outline;

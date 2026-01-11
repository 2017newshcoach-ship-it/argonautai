import React, { useState } from 'react';
import { Target, FileText, CheckCircle, Loader2, RefreshCw, LayoutTemplate } from 'lucide-react';
import { BlogInput, PostBrief } from '../../types';
import { runBriefBuilder } from '../../services/geminiService'; // Need to add this to service

interface Props {
    blogInput: BlogInput;
    setBlogInput: React.Dispatch<React.SetStateAction<BlogInput>>;
    onNext: () => void;
    onBack: () => void;
}

export default function Step3Briefing({ blogInput, setBlogInput, onNext, onBack }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [brief, setBrief] = useState<PostBrief | null>(blogInput.postBrief || null);
    const [error, setError] = useState<string | null>(null);

    // Initial Trigger
    React.useEffect(() => {
        if (!brief && blogInput.insightCard && !isGenerating) {
            handleGenerateBrief();
        }
    }, []);

    const handleGenerateBrief = async () => {
        if (!blogInput.insightCard) return;
        setIsGenerating(true);
        setError(null);
        try {
            const result = await runBriefBuilder(blogInput.insightCard);
            setBrief(result);
            setBlogInput(prev => ({ ...prev, postBrief: result }));
        } catch (e: any) {
            setError(e.message || "브리핑 생성 실패");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Step 3. Post Briefing (기획)</h2>
                <p className="text-gray-500">확보된 재료(Resource)를 바탕으로 최적의 글감과 전략을 설계합니다.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    ⚠️ {error} <button onClick={handleGenerateBrief} className="underline text-sm ml-2">재시도</button>
                </div>
            )}

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">
                        Insight Card 분석 중... <br />
                        최적의 클러스터를 찾고 있습니다.
                    </p>
                </div>
            ) : brief ? (
                <div className="bg-white border-2 border-indigo-100 rounded-xl overflow-hidden shadow-lg animate-fade-in-up">
                    <div className="bg-indigo-900 text-white p-6 flex justify-between items-start">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 text-xs font-bold mb-3 border border-indigo-700">
                                <Target className="w-3 h-3" /> STRATEGIC BRIEF
                            </span>
                            <h3 className="text-2xl font-bold leading-tight">
                                {brief.cluster}
                            </h3>
                            <p className="text-indigo-300 text-sm mt-2 flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4" /> Case Type:
                                <span className="text-white font-bold bg-indigo-700 px-2 rounded">
                                    {brief.caseType}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={handleGenerateBrief}
                            className="p-2 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
                            title="Regenerate"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Audience</label>
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-800 font-medium">
                                    {brief.target}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purpose</label>
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-800 font-medium">
                                    {brief.purpose}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Core Question</label>
                            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 font-bold text-lg text-center">
                                " {brief.question} "
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Execution Frame</label>
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg text-gray-600 bg-gray-50">
                                <LayoutTemplate className="w-5 h-5 text-gray-400" />
                                {brief.frame}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                        <button
                            onClick={onBack}
                            className="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium text-sm"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Approve Brief & Start Writing <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

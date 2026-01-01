
import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Download, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogInput, StyleCard } from '../../types';
import { runWriterStream, tuneStyle } from '../../services/geminiService';
import { renderPostContent } from '../../utils';

interface Props {
    blogInput: BlogInput;
    styles: { styleGuide: string; brandGuide: string; styleCard?: StyleCard };
    knowledgeBaseText: string;
}

export default function Step3Writer({ blogInput, styles, knowledgeBaseText }: Props) {
    const [content, setContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Style Tuner State
    const [finalText, setFinalText] = useState("");
    const [isTuning, setIsTuning] = useState(false);
    const [tuningResult, setTuningResult] = useState<{ analysis: string, suggestions: any[] } | null>(null);

    const handleTuneStyle = async () => {
        if (!finalText || !content) return;
        setIsTuning(true);
        try {
            const result = await tuneStyle(content, finalText, styles.styleGuide);
            setTuningResult(result);
        } catch (e) {
            console.error(e);
            alert("스타일 분석 중 오류가 발생했습니다.");
        } finally {
            setIsTuning(false);
        }
    };

    useEffect(() => {
        // Auto-start writing if content is empty (and blueprint is ready)
        if (!content && blogInput.blueprint && !isStreaming) {
            handleStartWriting();
        }
    }, []);

    const handleStartWriting = async () => {
        setIsStreaming(true);
        setContent("");
        setProgress(5);

        try {
            // Mock sources for now or pass from insightCard
            const sources = blogInput.insightCard?.sources.map(s => ({
                title: s.title,
                uri: s.url || "Internal DB"
            })) || [];

            const stream = runWriterStream(
                blogInput,
                styles.styleCard || {} as any, // styles.styleCard might be undefined initially
                blogInput.insightCard ? JSON.stringify(blogInput.insightCard.facts) : "",
                sources,
                styles.styleGuide,
                styles.brandGuide
            );

            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk;
                setContent(fullText);

                // Auto-scroll
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }

                // Fake progress
                setProgress(Math.min(95, fullText.length / 50));
            }
            setProgress(100);
        } catch (e) {
            console.error(e);
            setContent(prev => prev + "\n\n[Error: Writing failed. Please try again.]");
        } finally {
            setIsStreaming(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        alert("Copied directly to clipboard!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 flex justify-center items-center gap-2">
                    <PenTool className="w-6 h-6 text-indigo-600" />
                    The Writer
                </h2>
                <p className="text-gray-500">
                    {isStreaming ? "설계도(Blueprint)에 따라 집필 중입니다..." : "집필이 완료되었습니다."}
                </p>
            </div>

            {/* Progress Bar */}
            {isStreaming && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            {/* Editor/Preview Area */}
            <div
                ref={scrollRef}
                className="bg-white border text-left border-gray-200 rounded-xl shadow-lg min-h-[60vh] max-h-[70vh] overflow-y-auto p-8 prose prose-indigo max-w-none whitespace-pre-wrap"
            >
                {content ? (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom renderer for citations [#1] if needed, but text is fine for now
                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline" />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                        <p>Initializing Writer Engine...</p>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm text-gray-500 font-mono">
                    {content.length} chars / {content.split(' ').length} words
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={handleStartWriting}
                        disabled={isStreaming}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isStreaming ? 'animate-spin' : ''}`} /> Rewrite
                    </button>

                    <button
                        onClick={copyToClipboard}
                        disabled={isStreaming || !content}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2">
                            {isStreaming ? 'Writing...' : <><Copy className="w-4 h-4" /> Copy Post</>}
                        </div>
                    </button>
                </div>
            </div>

            {/* Style DNA Tuner (Feedback Loop) */}
            <div className="mt-12 pt-8 border-t-2 border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            🧬 Style DNA Tuner
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-bold">Beta</span>
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            발행 전 수정한 **최종 원고**를 넣으면, AI가 차이를 분석해 **나만의 스타일 규칙**을 찾아냅니다.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">
                            내가 수정한 최종 글 (Final Version)
                        </label>
                        <textarea
                            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm font-sans placeholder:text-slate-300"
                            placeholder="네이버 블로그 에디터에서 최종적으로 수정한 글을 여기에 붙여넣으세요..."
                            value={finalText}
                            onChange={(e) => setFinalText(e.target.value)}
                        />
                        <button
                            onClick={handleTuneStyle}
                            disabled={isTuning || !finalText}
                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isTuning ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                "🔍 스타일 차이 분석하기 (Analyze Diff)"
                            )}
                        </button>
                    </div>

                    {/* Result Area */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full">
                        {tuningResult ? (
                            <div className="space-y-6 h-full overflow-y-auto max-h-[400px]">
                                <div>
                                    <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> 분석 결과
                                    </h4>
                                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm leading-relaxed">
                                        {tuningResult.analysis}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                        💡 제안된 새 규칙 (Suggestions)
                                    </h4>
                                    {tuningResult.suggestions.length > 0 ? (
                                        <div className="space-y-3">
                                            {tuningResult.suggestions.map((s, i) => (
                                                <div key={i} className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm transition-all hover:shadow-md group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">{s.targetSection}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${s.action === 'Add' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {s.action}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-800 font-medium text-sm mb-3">"{s.rule}"</p>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(`- ${s.rule}`); alert("규칙이 복사되었습니다. 스타일 가이드 파일에 붙여넣으세요!"); }}
                                                        className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Copy className="w-3 h-3" /> 규칙 복사하기
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">감지된 스타일 차이가 없습니다.</p>
                                    )}
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg">
                                    ⚠️ <strong>안전한 반영을 위해:</strong> 위 규칙이 마음에 들면 [복사]하여 <code>writing style guide</code> 파일에 직접 붙여넣으세요. 자동으로는 반영되지 않습니다.
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-2xl">🧬</span>
                                </div>
                                <p className="text-sm text-center max-w-[200px]">
                                    왼쪽에 최종 글을 넣고 분석하면,<br />
                                    <strong>"내 스타일"</strong>을 추출해 드립니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


import React, { useState, useEffect } from 'react';
import { Pencil, Save, CheckCircle, Loader2, FileText, LayoutTemplate, MessageSquare, ArrowUp, ArrowDown, Trash2, Plus, X } from 'lucide-react';
import { BlogInput, Blueprint, InsightCard } from '../../types';
import { suggestBlueprint } from '../../services/geminiService';

interface Props {
    blogInput: BlogInput;
    setBlogInput: React.Dispatch<React.SetStateAction<BlogInput>>;
    onNext: () => void;
    styles: { styleGuide: string; brandGuide: string };
}

export default function Step2Architect({ blogInput, setBlogInput, onNext, styles }: Props) {
    const [blueprint, setBlueprint] = useState<Blueprint | null>(blogInput.blueprint || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editing State
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
    const [tempSection, setTempSection] = useState<any>(null);

    // Auto-generate on mount if not exists
    useEffect(() => {
        if (!blueprint && blogInput.insightCard) {
            generateBlueprint();
        }
    }, []);

    const updateBlueprint = (newBlueprint: Blueprint) => {
        setBlueprint(newBlueprint);
        setBlogInput(prev => ({ ...prev, blueprint: newBlueprint }));
    };

    const generateBlueprint = async () => {
        if (!blogInput.insightCard) return;
        setLoading(true);
        setError(null);
        try {
            const result = await suggestBlueprint(
                blogInput.topic,
                blogInput.insightCard,
                styles.styleGuide,
                styles.brandGuide,
                blogInput.targetAudience
            );
            updateBlueprint(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // -- Header Editing --
    const handleTitleChange = (newTitle: string) => {
        if (blueprint) updateBlueprint({ ...blueprint, title: newTitle });
    };

    // -- Section Editing Handlers --
    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (!blueprint) return;
        const sections = [...blueprint.sections];
        if (direction === 'up' && index > 0) {
            [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
        } else if (direction === 'down' && index < sections.length - 1) {
            [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        }
        updateBlueprint({ ...blueprint, sections });
    };

    const deleteSection = (index: number) => {
        if (!blueprint) return;
        if (confirm("Are you sure you want to remove this section?")) {
            const sections = blueprint.sections.filter((_, i) => i !== index);
            updateBlueprint({ ...blueprint, sections });
        }
    };

    const addSection = () => {
        if (!blueprint) return;
        const newSection = {
            sectionId: blueprint.sections.length + 1,
            title: "New Section",
            description: "Describe the content of this section...",
            keySentence: "Key takeaway for this section.",
            sourceIds: []
        };
        updateBlueprint({ ...blueprint, sections: [...blueprint.sections, newSection] });
        setEditingSectionIndex(blueprint.sections.length); // Auto-open edit mode
        setTempSection(newSection);
    };

    const startEditing = (index: number, section: any) => {
        setEditingSectionIndex(index);
        setTempSection({ ...section });
    };

    const saveSectionEdit = () => {
        if (!blueprint || editingSectionIndex === null) return;
        const sections = [...blueprint.sections];
        sections[editingSectionIndex] = tempSection;
        updateBlueprint({ ...blueprint, sections });
        setEditingSectionIndex(null);
        setTempSection(null);
    };

    const cancelEdit = () => {
        setEditingSectionIndex(null);
        setTempSection(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Architecting Blueprint...</h3>
                <p className="text-gray-500">재료(Fact)와 가이드(Guide)를 결합하여 구조를 설계 중입니다.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 font-bold mb-4">{error}</div>
                <button onClick={generateBlueprint} className="px-4 py-2 bg-indigo-600 text-white rounded">Retry</button>
            </div>
        );
    }

    if (!blueprint) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">The Architect's Blueprint</h2>
                <p className="text-gray-500">편집장이 설계한 기획안입니다. 섹션을 자유롭게 수정, 이동, 추가할 수 있습니다.</p>
            </div>

            {/* Blueprint Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
                {/* Header: Title & Flow */}
                <div className="bg-slate-50 p-6 border-b border-slate-200 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Blog Title</label>
                        <input
                            value={blueprint.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full text-xl font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 focus:outline-none pb-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Logic Flow</label>
                        <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg font-medium">
                            <LayoutTemplate className="w-4 h-4" />
                            {blueprint.flow}
                        </div>
                    </div>
                </div>

                {/* Sections List */}
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-500 uppercase">Section Guide</h3>
                        <button onClick={addSection} className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Section
                        </button>
                    </div>

                    <div className="space-y-4">
                        {blueprint.sections.map((section, idx) => (
                            <div key={idx} className={`relative pl-8 border-l-2 transition-colors group ${editingSectionIndex === idx ? 'border-indigo-500' : 'border-slate-200 hover:border-indigo-400'}`}>
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full transition-colors ${editingSectionIndex === idx ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-200 group-hover:bg-indigo-500'}`} />

                                {/* Edit Mode */}
                                {editingSectionIndex === idx ? (
                                    <div className="bg-indigo-50 p-4 rounded-lg space-y-3 border border-indigo-200 shadow-inner">
                                        <input
                                            value={tempSection.title}
                                            onChange={(e) => setTempSection({ ...tempSection, title: e.target.value })}
                                            className="w-full font-bold text-gray-900 bg-white border border-indigo-200 rounded p-2 text-sm"
                                            placeholder="Section Title"
                                        />
                                        <textarea
                                            value={tempSection.description}
                                            onChange={(e) => setTempSection({ ...tempSection, description: e.target.value })}
                                            className="w-full text-sm text-gray-600 bg-white border border-indigo-200 rounded p-2 h-20 resize-none"
                                            placeholder="Description"
                                        />
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-orange-500" />
                                            <input
                                                value={tempSection.keySentence}
                                                onChange={(e) => setTempSection({ ...tempSection, keySentence: e.target.value })}
                                                className="flex-1 text-sm text-orange-700 bg-white border border-orange-200 rounded p-2 italic"
                                                placeholder="Key takeaway sentence"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={saveSectionEdit} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold flex items-center gap-1">
                                                <Save className="w-3 h-3" /> Save
                                            </button>
                                            <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded text-xs font-bold flex items-center gap-1">
                                                <X className="w-3 h-3" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="space-y-2 group/item">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-gray-800">{section.title}</h4>
                                                <span className="text-xs text-gray-400">Sec {idx + 1}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                                <button onClick={() => moveSection(idx, 'down')} disabled={idx === blueprint.sections.length - 1} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                                <button onClick={() => startEditing(idx, section)} className="p-1 text-gray-400 hover:text-indigo-600"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => deleteSection(idx)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded block">{section.description}</p>

                                        <div className="flex items-start gap-2 mt-2">
                                            <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-orange-700 italic">"{section.keySentence}"</span>
                                        </div>

                                        {/* Source Tags */}
                                        {section.sourceIds && section.sourceIds.length > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {section.sourceIds.map(srcId => (
                                                    <span key={srcId} className="text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                        Ref: {srcId}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Empty State / Add Suggestion */}
                    {blueprint.sections.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="mb-2">No sections defined.</p>
                            <button onClick={addSection} className="text-indigo-600 font-bold hover:underline">Add First Section</button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                    <button
                        onClick={onNext}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Approve Blueprint & Write <FileText className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

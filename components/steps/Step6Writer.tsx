
import React from 'react';
import { renderPostContent } from '../../utils';

interface Step6Props {
    finalPost: string;
    setCurrentStep: (step: number) => void;
    setFinalPost: (post: string) => void;
}

const Step6Writer: React.FC<Step6Props> = ({ finalPost, setCurrentStep, setFinalPost }) => {
    return (
        <div className="space-y-12">
            <h2 className="text-4xl font-black text-slate-900">Expert Analysis Complete</h2>
            <div className="bg-white rounded-[4rem] border shadow-2xl overflow-hidden">
                <div className="p-16 md:p-24 whitespace-pre-wrap text-slate-800 leading-[2.4] font-serif text-2xl">
                    {renderPostContent(finalPost)}
                </div>
            </div>
            <button onClick={() => { setCurrentStep(1); setFinalPost(''); }} className="w-full py-7 bg-slate-950 text-white rounded-[2rem] font-black">새 프로젝트 시작</button>
        </div>
    );
};

export default Step6Writer;

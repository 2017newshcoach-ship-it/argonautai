
import React from 'react';
import { ExternalLink } from 'lucide-react';

export const renderPostContent = (text: string) => {
    const parts = text.split(/(\[#\d+\]|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
        if (!part) return null;
        const groundingMatch = part.match(/^\[#(\d+)\]$/);
        if (groundingMatch) return <sup key={ `g-${i}` } className = "text-[10px] font-black text-indigo-400 mx-0.5 opacity-60 bg-indigo-50 px-0.5 rounded" > { groundingMatch[1]} </sup>;
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) return <a key={ `l-${i}` } href = { linkMatch[2]} target = "_blank" rel = "noopener noreferrer" className = "text-indigo-600 font-bold border-b border-indigo-200 hover:bg-indigo-50 transition-all px-0.5 inline-flex items-center gap-0.5 no-underline" > { linkMatch[1]} < ExternalLink size = { 10} className = "opacity-40" /> </a>;
        return part;
    });
};

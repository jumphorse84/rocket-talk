import React from 'react';
import { Sparkles, X } from 'lucide-react';

export default function AiThankYouModal({ isOpen, onClose, generatedText, onSend, isGenerating }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold flex gap-2"><Sparkles className="text-[#fee500]" /> AI 답장 추천</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-sm min-h-[80px] flex items-center justify-center text-center">{isGenerating ? "AI가 작성중..." : generatedText}</div>
                <button onClick={() => onSend(generatedText)} disabled={isGenerating} className="mt-3 w-full bg-[#fee500] py-3 rounded-xl font-bold">이 내용으로 전송</button>
            </div>
        </div>
    );
}

import React from 'react';
import { Quote, X } from 'lucide-react';

export default function JournalViewModal({ isOpen, onClose, text, title }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-xs p-8 rounded-xl shadow-2xl relative text-center border-4 border-double border-amber-200">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md">
                    <Quote size={20} />
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500"><X size={20} /></button>
                <h3 className="mt-4 font-bold text-amber-800 text-lg mb-4">{title}</h3>
                <p className="text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">{text}</p>
                <div className="mt-6 pt-4 border-t border-amber-100 flex justify-center">
                    <span className="text-xs text-amber-400 font-bold tracking-widest uppercase">Rocket Talk Journal</span>
                </div>
            </div>
        </div>
    );
}

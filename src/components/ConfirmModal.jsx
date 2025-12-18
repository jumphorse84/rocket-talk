import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, message, subMessage }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4"><AlertCircle size={24} /></div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{message}</h3>
                    {subMessage && <p className="text-sm text-slate-500">{subMessage}</p>}
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">취소</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600">확인</button>
                </div>
            </div>
        </div>
    );
}

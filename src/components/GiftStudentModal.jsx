import React from "react";
import { Gift, X } from "lucide-react";

export default function GiftStudentModal({ isOpen, onClose, couriers, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[70vh]">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-slate-900">선물 받을 학생 선택</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {couriers.map(courier => (
                        <button key={courier.id} onClick={() => onSelect(courier)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 transition-colors text-left">
                            <img src={courier.photoUrl} className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-slate-800">{courier.name}</p>
                                <p className="text-xs text-slate-500">{courier.description || "학생 기사"}</p>
                            </div>
                            <Gift size={16} className="text-indigo-400" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

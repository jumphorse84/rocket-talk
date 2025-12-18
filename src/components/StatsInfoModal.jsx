import React from 'react';
import { X, Info } from 'lucide-react';

export default function StatsInfoModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-indigo-600" /> 평점 및 뱃지 기준
                </h3>
                <div className="space-y-4 text-sm text-slate-700">
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">⭐ 평균 평점</h4>
                        <p className="text-xs leading-relaxed text-slate-600">선생님들로부터 받은 별점의 평균입니다.<br />높은 평점을 유지하면 '친절왕'이 될 수 있어요!</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1">🏆 뱃지 획득 조건</h4>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-start gap-2">
                                <span className="bg-amber-100 text-amber-600 px-1.5 rounded font-bold shrink-0">⚡ 성실왕</span>
                                <span className="text-slate-600">누적 배송 <span className="font-bold text-slate-800">10회 이상</span> 달성 시</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-rose-100 text-rose-600 px-1.5 rounded font-bold shrink-0">🏅 친절왕</span>
                                <span className="text-slate-600">평점 <span className="font-bold text-slate-800">4.5점 이상</span> & 평가 <span className="font-bold text-slate-800">3건 이상</span></span>
                            </li>
                        </ul>
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700">확인했습니다</button>
            </div>
        </div>
    );
}

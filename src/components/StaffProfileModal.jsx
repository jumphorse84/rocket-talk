import React, { useState } from 'react';
import { X, Coins, Gift } from 'lucide-react';

export default function StaffProfileModal({ isOpen, onClose, staff, onGivePoints }) {
    const [pointsToGive, setPointsToGive] = useState("");
    const [giveReason, setGiveReason] = useState("");

    if (!isOpen || !staff) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/50 p-1 rounded-full"><X size={24} /></button>

                <div className="text-center mb-6 pt-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 border-4 border-white shadow-lg mb-3 overflow-hidden relative group">
                        {staff.photoUrl ? <img src={staff.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👩‍🏫</div>}
                        {staff.isOnline && <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                        {staff.name} <span className="text-sm font-normal text-slate-500">선생님</span>
                    </h2>
                    <p className="text-sm text-slate-500">{staff.role} • {staff.location}</p>

                    <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                        <span className="text-xs font-bold text-amber-500">현재 포인트</span>
                        <span className="text-lg font-black flex items-center gap-1"><Coins size={16} className="fill-amber-500 text-amber-500" /> {staff.points || 0} P</span>
                    </div>
                </div>

                <div className="bg-white border border-indigo-100 rounded-2xl p-5 mb-2 shadow-sm">
                    <h4 className="font-bold text-indigo-600 text-sm mb-3 flex items-center gap-2"><Gift size={16} /> 포인트 충전 (관리자)</h4>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="number"
                            value={pointsToGive}
                            onChange={(e) => setPointsToGive(e.target.value)}
                            placeholder="점수"
                            className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
                        />
                        <input
                            type="text"
                            value={giveReason}
                            onChange={(e) => setGiveReason(e.target.value)}
                            placeholder="사유 (예: 활동 지원금)"
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (pointsToGive && giveReason) {
                                onGivePoints(staff.id, parseInt(pointsToGive), giveReason);
                                setPointsToGive("");
                                setGiveReason("");
                            }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-95"
                    >
                        충전하기
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">지급된 포인트는 선생님 선물 상점에서 사용됩니다.</p>
            </div>
        </div>
    );
}

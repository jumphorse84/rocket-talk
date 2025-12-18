import React from "react";
import { Backpack, X, Clock } from "lucide-react";
import { getSeconds } from "../utils";

export default function RocketBackpackModal({ isOpen, onClose, items, onUseItem }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Backpack className="text-indigo-600" /> 로켓 배낭 (내 아이템)</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button></div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">{items.length === 0 ? (<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3"><Backpack size={48} className="opacity-30" /><p className="text-xs">배낭이 비어있어요. 상점에서 아이템을 구매해보세요!</p></div>) : ([...items].sort((a, b) => { if (a.isUsed === b.isUsed) return getSeconds(b.purchasedAt) - getSeconds(a.purchasedAt); return a.isUsed ? 1 : -1; }).map((item) => (<div key={item.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3 relative overflow-hidden transition-all ${item.isUsed ? 'border-slate-100 bg-slate-50' : 'border-indigo-100'}`}>{item.isUsed && (<div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-10"><span className="text-slate-800 font-black border-4 border-slate-800 px-4 py-2 rounded-xl transform -rotate-12 text-2xl">USED</span></div>)}<div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 ${item.isUsed ? 'bg-slate-100 border-slate-200 grayscale opacity-50' : 'bg-indigo-50 border-indigo-100'}`}>{item.icon}</div><div className={`flex-1 min-w-0 ${item.isUsed ? 'opacity-50' : ''}`}><h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                    {item.giftedBy ? <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">🎁 {item.giftedBy} 선생님 선물</p> : <p className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> {new Date(getSeconds(item.purchasedAt) * 1000).toLocaleDateString()} 구매</p>}
                </div><button onClick={() => { if (!item.isUsed && confirm(`${item.name}을(를) 사용하시겠습니까?\n(선생님께 화면을 보여드리고 사용해주세요!)`)) { onUseItem(item.id); } }} disabled={item.isUsed} className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 z-20 transition-all ${item.isUsed ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95'}`}>{item.isUsed ? '사용완료' : '사용하기'}</button></div>)))}</div>
            </div>
        </div>
    );
}

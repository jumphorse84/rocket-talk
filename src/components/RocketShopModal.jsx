import React from 'react';
import { ShoppingBag, X, Coins, Backpack } from 'lucide-react';

export default function RocketShopModal({ isOpen, onClose, userPoints, onPurchase, items, onOpenBackpack, isTeacher, onGift }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="text-rose-500" /> {isTeacher ? "선생님 선물 상점" : "로켓 포인트 상점"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-2 mb-4 shrink-0">
                    <div className="flex-1 bg-indigo-50 p-4 rounded-2xl flex flex-col justify-center shadow-inner">
                        <span className="text-xs font-bold text-indigo-400 mb-1">나의 보유 포인트</span>
                        <span className="text-2xl font-black text-indigo-600 flex items-center gap-1">
                            <Coins className="text-amber-500 fill-amber-500" size={20} /> {userPoints}
                        </span>
                    </div>
                    {!isTeacher && onOpenBackpack && (
                        <button onClick={onOpenBackpack} className="w-20 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shadow-sm active:scale-95 border border-slate-200">
                            <Backpack size={24} className="mb-1 text-indigo-600" />
                            <span className="text-[10px] font-bold">로켓 배낭</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 transition-all hover:border-indigo-200">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-200">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                                <p className="text-[10px] text-slate-500">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => isTeacher ? onGift?.(item) : onPurchase(item)}
                                disabled={userPoints < item.price}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center ${userPoints >= item.price
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md active:scale-95'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <span>{item.price} P</span>
                                {userPoints >= item.price ? <span className="text-[9px] opacity-80">{isTeacher ? "선물" : "구매"}</span> : <span className="text-[9px]">부족</span>}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

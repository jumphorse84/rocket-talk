import React, { useState, useMemo } from 'react';
import { ClipboardCheck, X, Search, Calendar, ClipboardList, Pencil, ExternalLink, ImageIcon, Printer } from 'lucide-react';
import { getSeconds } from '../utils';

export default function CompletedHistoryModal({ isOpen, onClose, parcels, onShowImage, onWriteJournal, onPrintReceipt }) {
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [searchQuery, setSearchQuery] = useState("");
    const filteredParcels = useMemo(() => {
        if (!parcels) return [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
        const weekAgo = todayStart - (7 * 24 * 60 * 60);
        const monthAgo = todayStart - (30 * 24 * 60 * 60);
        return parcels.filter(p => {
            const createdAtSeconds = getSeconds(p.createdAt);
            let dateMatch = true;
            if (filterPeriod === 'day') dateMatch = createdAtSeconds >= todayStart;
            else if (filterPeriod === 'week') dateMatch = createdAtSeconds >= weekAgo;
            else if (filterPeriod === 'month') dateMatch = createdAtSeconds >= monthAgo;
            const query = searchQuery.toLowerCase();
            const searchMatch = !query || p.receiver.toLowerCase().includes(query) || p.itemName.toLowerCase().includes(query);
            return dateMatch && searchMatch;
        });
    }, [parcels, filterPeriod, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardCheck className="text-emerald-500" /> 완료된 배송 목록
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
                </div>
                <div className="mb-4 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="선생님 이름 또는 물품명 검색" className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                        {['all', 'day', 'week', 'month'].map((period) => (
                            <button key={period} onClick={() => setFilterPeriod(period)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${filterPeriod === period ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                                {period === 'all' ? '전체' : period === 'day' ? '오늘' : period === 'week' ? '일주일' : '한달'}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <p className="text-sm font-bold text-slate-700"> 총 <span className="text-emerald-600">{filteredParcels.length}</span>건의 배송 </p>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {new Date().toLocaleDateString()} 기준
                        </p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    {filteredParcels.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                            <ClipboardList size={32} className="opacity-30" /> <span>해당하는 배송 내역이 없습니다.</span>
                        </div>
                    ) : (
                        filteredParcels.map((parcel) => (
                            <div key={parcel.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-bold">배송완료</span>
                                        <span className="text-[10px] text-slate-400 truncate">{parcel.arrivedAt}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{parcel.itemName}</h4>
                                    <div className="text-xs text-slate-500 truncate">
                                        <p>To. {parcel.receiver} 선생님</p>
                                        <p className="text-[10px] opacity-70 truncate">위치: {parcel.location}</p>
                                    </div>
                                    {parcel.journal ? (
                                        <div className="mt-2 text-[10px] bg-amber-50 text-amber-700 p-2 rounded-lg truncate"> 📝 일지: {parcel.journal} </div>
                                    ) : (
                                        onWriteJournal && (
                                            <button onClick={() => onWriteJournal(parcel)} className="mt-2 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                                <Pencil size={12} /> 배송 일지 쓰기
                                            </button>
                                        )
                                    )}
                                    {/* Print Receipt Button */}
                                    {onPrintReceipt && (
                                        <button
                                            onClick={() => onPrintReceipt(parcel)}
                                            className="mt-2 text-xs bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 border border-slate-200"
                                        >
                                            <Printer size={12} /> 인수증 출력
                                        </button>
                                    )}
                                </div>
                                <div className="w-16 flex flex-col items-center justify-center gap-1 shrink-0">
                                    {parcel.proofImage ? (
                                        <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden cursor-pointer relative group shadow-sm" onClick={() => onShowImage(parcel.proofImage)}>
                                            <img src={parcel.proofImage} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink size={12} className="text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon size={20} />
                                            <span className="text-[8px]">인증없음</span>
                                        </div>
                                    )}
                                    <span className="text-[9px] text-slate-400 font-bold">{parcel.proofType === 'SIGNATURE' ? '서명' : '사진'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

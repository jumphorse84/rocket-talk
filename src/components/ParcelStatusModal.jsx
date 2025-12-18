import React from 'react';
import { X, Building, MapPin, Trash2 } from 'lucide-react';
import ParcelStatusBadge from './ParcelStatusBadge';
import { STAFF_LOCATIONS } from '../data';

export default function ParcelStatusModal({ isOpen, onClose, filterType, parcels, staffList, onDelete }) {
    if (!isOpen || !filterType) return null;
    const filteredParcels = parcels.filter(p => {
        if (filterType === 'TOTAL') return true;
        if (filterType === 'WAITING') return p.status === 'PENDING';
        if (filterType === 'PROCESSING') return p.status === 'DELIVERING';
        if (filterType === 'COMPLETED') return p.status === 'COMPLETED';
        return true;
    });
    const groupedParcels = STAFF_LOCATIONS.reduce((acc, loc) => { acc[loc] = []; return acc; }, { "기타": [] });
    filteredParcels.forEach(p => {
        const receiver = staffList.find(s => s.id === p.receiverId);
        let location = "기타";
        if (receiver) { const matchedLoc = STAFF_LOCATIONS.find(loc => receiver.location.includes(loc)); if (matchedLoc) location = matchedLoc; }
        else if (p.location) { const matchedLoc = STAFF_LOCATIONS.find(loc => p.location.includes(loc)); if (matchedLoc) location = matchedLoc; }
        if (!groupedParcels[location]) groupedParcels[location] = [];
        groupedParcels[location].push(p);
    });
    const getTitle = () => { switch (filterType) { case 'TOTAL': return '📦 전체 택배 현황'; case 'WAITING': return '⏳ 배송 대기 목록'; case 'PROCESSING': return '🚚 배송 중 목록'; case 'COMPLETED': return '✅ 배송 완료 목록'; default: return '택배 현황'; } };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">{getTitle()} <span className="text-sm font-normal text-slate-500">({filteredParcels.length}건)</span></h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button></div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">{filteredParcels.length === 0 ? (<div className="text-center py-20 text-slate-400">해당하는 택배 내역이 없습니다.</div>) : (STAFF_LOCATIONS.concat(["기타"]).map(location => {
                    const items = groupedParcels[location]; if (!items || items.length === 0) return null; return (<div key={location} className="animate-in slide-in-from-bottom-2 fade-in duration-300"><div className="flex items-center gap-2 mb-3 bg-slate-100/50 p-2 rounded-lg sticky top-0 backdrop-blur-sm z-10"><Building size={16} className="text-indigo-500" /><h3 className="font-bold text-slate-700 text-sm">{location}</h3><span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-medium">{items.length}건</span></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{items.map((p) => (<div key={p.id} className={`p-4 rounded-2xl border flex flex-col justify-between shadow-sm transition-all hover:shadow-md relative group ${p.isUrgent ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>

                        {/* Delete Button */}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20"
                                title="삭제"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        <div><div className="flex justify-between items-start mb-2 pr-8"><span className={`text-xs font-bold px-2 py-1 rounded-md ${p.isUrgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{String(p.receiver)} 선생님</span><ParcelStatusBadge status={p.status} /></div><p className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 pr-6">{p.itemName}</p><p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {p.location}</p></div><div className="mt-3 pt-3 border-t border-black/5 flex justify-between items-end"><div className="text-[10px] text-slate-400">{p.sender ? `From: ${p.sender}` : '보낸이 미상'}</div>{p.courierName && <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">🚚 {p.courierName}</span>}</div></div>))}</div></div>);
                }))}</div>
            </div>
        </div>
    );
}

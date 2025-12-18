import React, { useState } from "react";
import { X, ShoppingBag, Pencil, Trash2 } from "lucide-react";

export default function ManageShopModal({ isOpen, onClose, items, onSave }) {
    const [localItems, setLocalItems] = useState(items);
    const [newItem, setNewItem] = useState({ name: "", price: "", icon: "", desc: "" });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", price: "", icon: "", desc: "" });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    React.useEffect(() => { setLocalItems(items); }, [items]);

    const handleAddItem = () => {
        if (!newItem.name || !newItem.price) return alert("이름과 가격은 필수입니다.");
        const item = { id: Date.now(), name: newItem.name, price: parseInt(newItem.price), icon: newItem.icon || "🎁", desc: newItem.desc || "선물입니다." };
        const updated = [...localItems, item];
        setLocalItems(updated); setNewItem({ name: "", price: "", icon: "", desc: "" });
    };
    const handleDeleteClick = (id) => { setDeleteConfirmId(id); };
    const handleConfirmDelete = () => { if (deleteConfirmId !== null) { const updated = localItems.filter(i => i.id !== deleteConfirmId); setLocalItems(updated); setDeleteConfirmId(null); } };
    const handleStartEdit = (item) => { setEditingId(item.id); setEditForm({ name: item.name, price: String(item.price), icon: item.icon, desc: item.desc }); };
    const handleCancelEdit = () => { setEditingId(null); setEditForm({ name: "", price: "", icon: "", desc: "" }); };
    const handleSaveEdit = () => { if (!editForm.name || !editForm.price) return alert("이름과 가격은 필수입니다."); const updated = localItems.map(item => item.id === editingId ? { ...item, name: editForm.name, price: parseInt(editForm.price), icon: editForm.icon, desc: editForm.desc } : item); setLocalItems(updated); setEditingId(null); };
    const handleSaveAll = () => { onSave(localItems); onClose(); };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            {deleteConfirmId && (<div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl animate-in fade-in duration-200"><div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 text-center w-64 transform scale-100"><div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={24} /></div><h3 className="font-bold text-slate-800 mb-1">삭제하시겠습니까?</h3><p className="text-xs text-slate-500 mb-4">이 동작은 되돌릴 수 없습니다.</p><div className="flex gap-2"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">취소</button><button onClick={handleConfirmDelete} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-600 transition-colors">삭제</button></div></div></div>)}
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ShoppingBag className="text-rose-500" /> 상점 물품 관리</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button></div>
                <div className="bg-slate-50 p-4 rounded-2xl mb-4 shrink-0 border border-slate-100"><h3 className="text-xs font-bold text-slate-500 mb-2">새 물품 등록</h3><div className="flex gap-2 mb-2"><input value={newItem.icon} onChange={e => setNewItem({ ...newItem, icon: e.target.value })} placeholder="이모지" className="w-16 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" /><input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="물품명" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" /><input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="포인트" className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" /></div><div className="flex gap-2"><input value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="설명 (선택)" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" /><button onClick={handleAddItem} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">추가</button></div></div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">{localItems.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">등록된 물품이 없습니다.</p>}{localItems.map(item => (<div key={item.id} className="flex flex-col bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">{editingId === item.id ? (<div className="p-3 bg-indigo-50/50"><div className="flex gap-2 mb-2"><input value={editForm.icon} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} className="w-14 px-2 py-1.5 rounded-lg border border-indigo-200 text-sm text-center" /><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="flex-1 px-2 py-1.5 rounded-lg border border-indigo-200 text-sm" placeholder="이름" /><input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-16 px-2 py-1.5 rounded-lg border border-indigo-200 text-sm" placeholder="가격" /></div><div className="flex gap-2"><input value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} className="flex-1 px-2 py-1.5 rounded-lg border border-indigo-200 text-xs" placeholder="설명" /><button onClick={handleSaveEdit} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">확인</button><button onClick={handleCancelEdit} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300">취소</button></div></div>) : (<div className="flex items-center justify-between p-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl">{item.icon}</div><div><p className="font-bold text-slate-800 text-sm">{item.name}</p><p className="text-[10px] text-slate-500">{item.desc} • <span className="text-amber-500 font-bold">{item.price}P</span></p></div></div><div className="flex items-center gap-1"><button onClick={() => handleStartEdit(item)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={16} /></button><button onClick={() => handleDeleteClick(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button></div></div>)}</div>))}</div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0"><button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200">취소</button><button onClick={handleSaveAll} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-md">저장 완료</button></div>
            </div>
        </div>
    );
}

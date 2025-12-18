import React, { useState, useRef } from "react";
import { compressImage } from "../utils";
import { TIME_SLOTS } from "../data";

export default function AddCourierModal({ onClose, onAdd, onEdit, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedSlots, setSelectedSlots] = useState(initialData?.availableSlots || []);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random() * 1000)}`);
  const fileInputRef = useRef(null);

  const toggleSlot = (slot) => setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);

  const handleFileChange = async (e) => {
    if (e.target.files?.[0]) {
      try {
        const compressed = await compressImage(e.target.files[0]);
        setPhotoUrl(compressed);
      } catch (error) {
        console.error("Image compression failed", error);
      }
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return alert("이름을 입력해주세요.");
    if (selectedSlots.length === 0) return alert("시간을 선택해주세요.");
    const finalDesc = description.trim() || "성실하게 배송하겠습니다! 🚚";
    if (initialData && onEdit) onEdit(initialData.id, name, photoUrl, selectedSlots, finalDesc);
    else onAdd(name, photoUrl, selectedSlots, finalDesc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-bold text-slate-900">{initialData ? "배송 기사 수정" : "배송 기사 등록"}</h3>
        <div className="flex flex-col items-center mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img src={photoUrl} className="w-24 h-24 rounded-full border-2 border-emerald-500 bg-slate-50 object-cover" />
          <p className="text-xs text-slate-400 mt-2">사진 변경 (클릭)</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
        <div className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="기사님 이름" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="한줄 소개 (예: 1반 김철수입니다)" />
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot} onClick={() => toggleSlot(slot)} className={`px-3 py-1 text-xs rounded-full ${selectedSlots.includes(slot) ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-sm font-bold">취소</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-bold">{initialData ? "수정완료" : "등록"}</button>
        </div>
      </div>
    </div>
  );
}

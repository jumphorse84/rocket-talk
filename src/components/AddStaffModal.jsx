import React, { useState, useRef } from "react";
import { compressImage } from "../utils";
import { STAFF_LOCATIONS } from "../data";

export default function AddStaffModal({ onClose, onAdd, onEdit, initialData }) {
    const [name, setName] = useState(initialData?.name || "");
    const [role, setRole] = useState(initialData?.role || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [location, setLocation] = useState(initialData?.location || STAFF_LOCATIONS[0]);
    const [photoUrl, setPhotoUrl] = useState(() => initialData?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random() * 1000)}`);
    const fileInputRef = useRef(null);

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
        if (!name.trim()) return alert("선생님 성함을 입력해주세요.");
        if (!role.trim()) return alert("직책/담당을 입력해주세요.");

        if (initialData && onEdit) {
            onEdit(initialData.id, name, role, location, photoUrl, description);
        } else {
            onAdd(name, role, location, photoUrl, description);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">{initialData ? "선생님 명단 수정" : "선생님 명단 추가"}</h3>

                <div className="flex flex-col items-center mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full border-2 border-indigo-500 bg-slate-50 overflow-hidden flex items-center justify-center">
                        {photoUrl && !photoUrl.includes('dicebear') ? (
                            <img src={photoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">👩‍🏫</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">사진 변경 (클릭)</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <div className="space-y-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                        placeholder="선생님 성함 (예: 홍길동)"
                    />
                    <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                        placeholder="직책/담당 (예: 1학년부장(국어))"
                    />
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 text-sm bg-white focus:border-indigo-500 outline-none transition-colors appearance-none"
                    >
                        {STAFF_LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                        placeholder="상태 메시지 (선택)"
                    />
                </div>

                <div className="mt-6 flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors">취소</button>
                    <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">{initialData ? "수정완료" : "추가"}</button>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

export default function WritePostModal({ onClose, onPost, couriers, authorName }) {
    const [selectedCourier, setSelectedCourier] = useState("");
    const [content, setContent] = useState("");
    const handleSubmit = () => { if (!selectedCourier) return alert("칭찬할 기사님을 선택해주세요."); if (!content.trim()) return alert("내용을 입력해주세요."); onPost(selectedCourier, content); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2"><ThumbsUp className="text-rose-500" size={20} /> 칭찬합니다 글쓰기</h3>
                <div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">칭찬할 기사님</label><select value={selectedCourier} onChange={(e) => setSelectedCourier(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:border-rose-500"><option value="">기사님 선택</option>{couriers.map(c => <option key={c.id} value={c.name}>{c.name} 기사님</option>)}</select></div><div><label className="block text-xs font-bold text-slate-500 mb-1">칭찬 내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-32 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none" placeholder={`${authorName} 선생님, 기사님에게 힘이 되는 따뜻한 말을 남겨주세요!`} /></div></div>
                <div className="mt-6 flex gap-2"><button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-sm font-bold">취소</button><button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-bold shadow-md hover:bg-rose-600">등록하기</button></div>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { Package, MapPin, CheckSquare, ChevronDown, Search, X } from 'lucide-react';

export default function RegisterParcelModal({ onClose, onRegister, staffList }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(""); const [baseLocation, setBaseLocation] = useState(""); const [detailLocation, setDetailLocation] = useState(""); const [item, setItem] = useState(""); const [qty, setQty] = useState(""); const [sender, setSender] = useState(""); const [isUrgent, setIsUrgent] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStaff = staffList.filter(s => s.id !== 'me' && (s.name.includes(searchQuery) || (s.role && s.role.includes(searchQuery))));
  const selectedTeacher = staffList.find(s => s.id === selectedTeacherId);

  const handleSelectTeacher = (teacher) => { setSelectedTeacherId(teacher.id); setBaseLocation(teacher.location || ""); setIsDropdownOpen(false); setSearchQuery(""); };
  const handleClearTeacher = (e) => { e.stopPropagation(); setSelectedTeacherId(""); setBaseLocation(""); setSearchQuery(""); };
  const handleSubmit = () => { if (!selectedTeacherId || !item || !sender) return alert("필수 정보를 입력해주세요."); const teacherName = staffList.find(s => s.id === selectedTeacherId)?.name || ""; const finalLocation = `${baseLocation} ${detailLocation}`.trim(); onRegister(selectedTeacherId, teacherName, finalLocation, item, qty, isUrgent, sender); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in zoom-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2"> <Package className="text-indigo-600" /> 물품 등록 </h3>
        <div className="space-y-4">
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">받는 선생님</label>
            <button type="button" onClick={() => { setIsDropdownOpen(v => !v); }} className={`w-full rounded-xl border px-3 py-2 text-sm bg-white flex items-center justify-between text-left transition-colors outline-none ${isDropdownOpen ? 'border-emerald-500' : 'border-slate-200'}`}>
              <span className={selectedTeacher ? 'text-slate-800' : 'text-slate-400'}>{selectedTeacher ? `${selectedTeacher.name} (${selectedTeacher.role})` : '선생님 선택'}</span>
              <span className="flex items-center gap-1 shrink-0">
                {selectedTeacher && <span onMouseDown={handleClearTeacher} className="p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"><X size={12} className="text-slate-400" /></span>}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="이름 또는 역할 검색..." />
                    {searchQuery && <button onMouseDown={() => setSearchQuery("")}><X size={12} className="text-slate-400 hover:text-slate-600" /></button>}
                  </div>
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredStaff.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-slate-400">검색 결과가 없습니다</li>
                  ) : filteredStaff.map(s => (
                    <li key={s.id} onMouseDown={() => handleSelectTeacher(s)} className={`px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-indigo-50 hover:text-indigo-700 ${s.id === selectedTeacherId ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'}`}>
                      {s.name} <span className="text-xs text-slate-400 font-normal">({s.role})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div> <label className="block text-xs font-bold text-slate-500 mb-1">기본 장소</label> <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2"> <MapPin size={14} className="text-slate-400 shrink-0" /> <input value={baseLocation} readOnly className="w-full bg-transparent text-sm text-slate-600 outline-none cursor-not-allowed" placeholder="자동" /> </div> </div>
            <div> <label className="block text-xs font-bold text-slate-500 mb-1">상세 위치</label> <input value={detailLocation} onChange={(e) => setDetailLocation(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="예: 책상 위" /> </div>
          </div>
          <div> <label className="block text-xs font-bold text-slate-500 mb-1">물품명</label> <input value={item} onChange={(e) => setItem(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="예: 교과서, 학습지" /> </div>
          <div> <label className="block text-xs font-bold text-slate-500 mb-1">보낸 곳 / 택배회사</label> <input value={sender} onChange={(e) => setSender(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="예: 쿠팡, 우체국, 교육청, 행정실" /> </div>
          <div> <label className="block text-xs font-bold text-slate-500 mb-1">수량 (선택)</label> <input value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" placeholder="예: 1박스" /> </div>
          <div onClick={() => setIsUrgent(!isUrgent)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isUrgent ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isUrgent ? 'bg-red-50 border-red-500' : 'bg-white border-slate-300'}`}> {isUrgent && <CheckSquare size={14} className="text-white" />} </div>
            <span className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>🚨 긴급 배송 (우선 처리)</span>
          </div>
        </div>
        <button onClick={handleSubmit} className={`mt-6 w-full text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 ${isUrgent ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}> {isUrgent ? '🚨 긴급 등록 및 알림 전송' : '등록 및 알림 전송'} </button>
        <button onClick={onClose} className="mt-2 w-full text-slate-400 text-xs hover:text-slate-600 py-2">닫기</button>
      </div>
    </div>
  );
}

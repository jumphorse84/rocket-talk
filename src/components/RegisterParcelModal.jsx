import React, { useState, useRef, useEffect } from 'react';
import { Package, MapPin, CheckSquare, ChevronDown, Search, X, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { compressImage } from '../utils';

export default function RegisterParcelModal({ onClose, onRegister, staffList }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(""); 
  const [baseLocation, setBaseLocation] = useState(""); 
  const [detailLocation, setDetailLocation] = useState(""); 
  const [item, setItem] = useState(""); 
  const [qty, setQty] = useState(""); 
  const [sender, setSender] = useState(""); 
  const [isUrgent, setIsUrgent] = useState(false);
  const [image, setImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(""); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStaff = staffList.filter(s => s.id !== 'me' && (s.name.includes(searchQuery) || (s.role && s.role.includes(searchQuery))));
  const selectedTeacher = staffList.find(s => s.id === selectedTeacherId);

  const handleSelectTeacher = (teacher) => { setSelectedTeacherId(teacher.id); setBaseLocation(teacher.location || ""); setIsDropdownOpen(false); setSearchQuery(""); };
  const handleClearTeacher = (e) => { e.stopPropagation(); setSelectedTeacherId(""); setBaseLocation(""); setSearchQuery(""); };
  
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (error) {
      console.error("Image compression failed", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => { 
    if (!selectedTeacherId || !item || !sender) return alert("필수 정보를 입력해주세요."); 
    const teacherName = staffList.find(s => s.id === selectedTeacherId)?.name || ""; 
    const finalLocation = `${baseLocation} ${detailLocation}`.trim(); 
    onRegister(selectedTeacherId, teacherName, finalLocation, item, qty, isUrgent, sender, image); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in zoom-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <h3 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2"> <Package className="text-indigo-600" /> 물품 등록 </h3>
        
        <div className="space-y-5">
          {/* 받는 선생님 선택 */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">받는 선생님</label>
            <button type="button" onClick={() => { setIsDropdownOpen(v => !v); }} className={`w-full rounded-2xl border px-4 py-3 text-sm bg-white flex items-center justify-between text-left transition-all outline-none ${isDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-sm' : 'border-slate-200'}`}>
              <span className={selectedTeacher ? 'text-slate-800 font-medium' : 'text-slate-400'}>{selectedTeacher ? `${selectedTeacher.name} (${selectedTeacher.role})` : '선생님 선택'}</span>
              <span className="flex items-center gap-1 shrink-0">
                {selectedTeacher && <span onMouseDown={handleClearTeacher} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"><X size={14} className="text-slate-400" /></span>}
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="이름 또는 역할 검색..." />
                    {searchQuery && <button onMouseDown={() => setSearchQuery("")}><X size={14} className="text-slate-400 hover:text-slate-600" /></button>}
                  </div>
                </div>
                <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredStaff.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-slate-400 italic">검색 결과가 없습니다</li>
                  ) : filteredStaff.map(s => (
                    <li key={s.id} onMouseDown={() => handleSelectTeacher(s)} className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-indigo-50 hover:text-indigo-700 ${s.id === selectedTeacherId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'}`}>
                      {s.name} <span className="text-xs text-slate-400 font-normal ml-1">({s.role})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div> <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">기본 장소</label> <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 shadow-inner"> <MapPin size={14} className="text-slate-400 shrink-0" /> <input value={baseLocation} readOnly className="w-full bg-transparent text-sm text-slate-600 outline-none cursor-not-allowed" placeholder="자동" /> </div> </div>
            <div> <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">상세 위치</label> <input value={detailLocation} onChange={(e) => setDetailLocation(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="예: 책상 위" /> </div>
          </div>

          <div> <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">물품명</label> <input value={item} onChange={(e) => setItem(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="예: 교과서, 학습지" /> </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div> <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">보낸 곳 / 택배사</label> <input value={sender} onChange={(e) => setSender(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="예: 쿠팡, 행정실" /> </div>
            <div> <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">수량 (선택)</label> <input value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="예: 1박스" /> </div>
          </div>

          {/* 사진 첨부 기능 추가 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">사진 첨부 (선택)</label>
            <div className="flex gap-3">
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
              {!image ? (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-400 group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    {isCompressing ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <Camera size={20} />}
                  </div>
                  <span className="text-xs font-medium">{isCompressing ? '처리 중...' : '사진 촬영 / 업로드'}</span>
                </button>
              ) : (
                <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <img src={image} className="w-full h-32 object-cover" alt="Parcel preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                      <Camera size={20} />
                    </button>
                    <button type="button" onClick={handleRemovePhoto} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div onClick={() => setIsUrgent(!isUrgent)} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${isUrgent ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${isUrgent ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}> {isUrgent && <CheckSquare size={16} className="text-white" />} </div>
            <span className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>🚨 긴급 배송 (우선 처리)</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <button onClick={handleSubmit} disabled={isCompressing} className={`w-full text-white py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${isUrgent ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-100' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-indigo-100'}`}> 
            {isUrgent ? '🚨 긴급 등록 및 알림 전송' : '등록 및 알림 전송'} 
          </button>
          <button onClick={onClose} className="w-full text-slate-400 text-xs font-medium hover:text-slate-600 py-3 transition-colors">나중에 하기</button>
        </div>
      </div>
    </div>
  );
}


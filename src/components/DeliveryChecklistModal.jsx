import React, { useState } from 'react';
import { User, Package, MapPin, Sparkles, Smile, Check, X, ClipboardCheck } from 'lucide-react';

export default function DeliveryChecklistModal({ isOpen, onClose, onConfirm, parcel }) {
    if (!isOpen || !parcel) return null;

    // Check items configuration
    const checks = [
        {
            icon: User,
            text: `받는 분이 '${parcel.receiver}' 선생님이 맞나요?`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100'
        },
        {
            icon: Package,
            text: "택배 상자에 선생님 성함이 정확히 적혀 있나요?",
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
        {
            icon: MapPin,
            text: `현재 위치가 '${parcel.location}' 이(가) 맞나요?`,
            color: 'text-rose-600',
            bgColor: 'bg-rose-100'
        },
        {
            icon: Sparkles,
            text: "물건이 파손되거나 찌그러지지 않았나요?",
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            icon: Smile,
            text: "선생님께 밝게 인사드리고 공손히 전달했나요?",
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        }
    ];

    const [checkedItems, setCheckedItems] = useState(new Array(checks.length).fill(false));
    const allChecked = checkedItems.every(Boolean);

    const toggleCheck = (idx) => {
        const newChecks = [...checkedItems];
        newChecks[idx] = !newChecks[idx];
        setCheckedItems(newChecks);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <ClipboardCheck className="text-indigo-600" />
                        배송 최종 확인
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Subtitle / Tip */}
                <div className="bg-slate-50 p-4 rounded-2xl mb-6 text-sm text-slate-600 leading-relaxed">
                    정확하고 안전한 배송을 위해<br />
                    아래 내용을 꼼꼼히 확인하고 체크해주세요! 👇
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-8">
                    {checks.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => toggleCheck(idx)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${checkedItems[idx] ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${checkedItems[idx] ? 'bg-indigo-500 text-white' : `${item.bgColor} ${item.color}`}`}>
                                {checkedItems[idx] ? <Check size={20} strokeWidth={3} /> : <item.icon size={20} />}
                            </div>
                            <span className={`text-sm font-bold leading-snug flex-1 ${checkedItems[idx] ? 'text-indigo-900' : 'text-slate-600'}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer Button */}
                <button
                    onClick={onConfirm}
                    disabled={!allChecked}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${allChecked ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    모두 확인했습니다! (서명/촬영) <span className="text-xl">›</span>
                </button>
            </div>
        </div>
    );
}

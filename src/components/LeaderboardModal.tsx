import React from 'react';
import { Courier } from '../App'; // We will export Courier from App.tsx
import { Trophy, Medal, Star, X } from 'lucide-react';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    couriers: Courier[];
}

export default function LeaderboardModal({ isOpen, onClose, couriers }: LeaderboardModalProps) {
    if (!isOpen) return null;

    // 정렬 (1순위: 포인트 높은순, 2순위: 레벨이 같다면 배달 완료 건수 등 - 현재 배달 건수 데이터가 없어 포인트 우선)
    const sortedCouriers = [...couriers].sort((a, b) => (b.points || 0) - (a.points || 0));

    const getMedalIcon = (index: number) => {
        switch (index) {
            case 0: return <Medal size={28} className="text-yellow-400 drop-shadow-md" />;
            case 1: return <Medal size={28} className="text-slate-300 drop-shadow-md" />;
            case 2: return <Medal size={28} className="text-amber-600 drop-shadow-md" />;
            default: return <span className="font-bold text-slate-400 w-7 text-center">{index + 1}</span>;
        }
    };

    const getRowClass = (index: number) => {
        switch (index) {
            case 0: return "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 transform scale-[1.02] shadow-sm z-10";
            case 1: return "bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200";
            case 2: return "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200";
            default: return "bg-white border text-slate-600";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 바깥 배경 (블러) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* 모달 창 */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* 헤더 */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Trophy size={32} className="text-yellow-300 drop-shadow-lg" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">명예의 전당</h2>
                            <p className="text-indigo-100 text-sm font-medium mt-0.5">이달의 훌륭한 배송기사 랭킹</p>
                        </div>
                    </div>
                </div>

                {/* 랭킹 리스트 */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50">
                    {sortedCouriers.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Star size={48} className="mx-auto mb-3 opacity-20" />
                            <p>아직 배송 데이터가 없습니다.</p>
                        </div>
                    ) : (
                        sortedCouriers.map((courier, index) => {
                            const currentLevel = Math.max(1, Math.floor(Math.sqrt((courier.points || 0) / 10)));

                            return (
                                <div key={courier.id} className={`flex items-center p-4 rounded-2xl transition-all ${getRowClass(index)}`}>
                                    {/* 순위 마크 */}
                                    <div className="w-10 flex justify-center mr-3">
                                        {getMedalIcon(index)}
                                    </div>

                                    {/* 프로필 사진 */}
                                    {courier.photoUrl ? (
                                        <img src={courier.photoUrl} alt={courier.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold border-2 border-white shadow-sm">
                                            {courier.name.charAt(0)}
                                        </div>
                                    )}

                                    {/* 정보 */}
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-lg ${index < 3 ? 'text-slate-800' : 'text-slate-600'}`}>{courier.name}</span>
                                            {index === 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-lg">1위</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 text-sm">
                                            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 rounded-md">Lv.{currentLevel}</span>
                                            <span className="text-slate-500 font-medium">{courier.points || 0} P</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

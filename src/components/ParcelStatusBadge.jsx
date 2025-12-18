import React from 'react';

export default function ParcelStatusBadge({ status }) {
    if (status === 'PENDING') return <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">수령대기</span>;
    if (status === 'WAITING') return <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded font-bold">기사배정중</span>;
    if (status === 'DELIVERING') return <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">배송중</span>;
    return <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded font-bold">배송완료</span>;
}

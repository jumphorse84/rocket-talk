import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationToast({ message, onClose, type = 'default' }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[92%] max-w-sm ${type === 'success' ? 'bg-indigo-600/95' : 'bg-slate-800/95'} backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 z-[100] animate-in slide-in-from-bottom-5`}>
      <div className={`mt-0.5 p-1.5 rounded-full text-slate-900 shrink-0 ${type === 'success' ? 'bg-white text-indigo-600' : 'bg-[#fee500]'}`}>
        <Bell size={14} fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold opacity-90 mb-0.5">{type === 'success' ? '알림 도착' : '새로운 알림'}</div>
        <div className="text-sm font-medium leading-snug break-words whitespace-pre-line">{String(message)}</div>
      </div>
      <button onClick={onClose} className="text-white/70 hover:text-white shrink-0"><X size={18} /></button>
    </div>
  );
}

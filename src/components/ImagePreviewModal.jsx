import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, title }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative max-w-sm w-full bg-white p-2 rounded-xl" onClick={e => e.stopPropagation()}>
                {title && <div className="absolute -top-10 left-0 text-white font-bold">{title}</div>}
                <img src={imageUrl} className="w-full h-auto rounded-lg" />
                <button onClick={onClose} className="absolute -top-2 -right-2 bg-black/50 text-white p-1 rounded-full"><X size={16} /></button>
            </div>
        </div>
    );
}

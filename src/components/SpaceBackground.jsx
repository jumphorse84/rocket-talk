import React from 'react';
import { Cloud } from 'lucide-react';

export default function SpaceBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
                <div key={i} className="absolute bg-white rounded-full opacity-40 animate-pulse" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', animationDuration: Math.random() * 3 + 2 + 's', animationDelay: Math.random() * 2 + 's' }} />
            ))}
            <Cloud className="absolute top-10 left-10 text-white/10 w-24 h-24" />
            <Cloud className="absolute bottom-20 right-10 text-white/10 w-32 h-32" />
        </div>
    );
}

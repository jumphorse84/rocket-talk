import React, { useEffect } from 'react';

export default function LaunchAnimation({ onFinish, iconUrl }) {
    useEffect(() => {
        const timer = setTimeout(onFinish, 2500);
        return () => clearTimeout(timer);
    }, []);

    const [stars] = React.useState(() => [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 20}%`,
        animationDuration: `${0.5 + Math.random()}s`,
        animationDelay: `${Math.random()}s`
    })));

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
            <style>{`
        @keyframes rocket-fly {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          20% { transform: translateY(10px) scale(0.95); }
          40% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(-1200px) scale(1.5); opacity: 0; }
        }
        @keyframes stars-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .rocket-launching { animation: rocket-fly 2s ease-in forwards; }
        .star-bg { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; opacity: 0.8; animation: stars-move 1s linear infinite; }
      `}</style>
            {stars.map((style, i) => (
                <div key={i} className="star-bg" style={style} />
            ))}
            <div className="rocket-launching flex flex-col items-center z-10">
                <div className="text-9xl filter drop-shadow-[0_0_20px_rgba(255,165,0,0.8)] w-32 h-32 flex items-center justify-center">
                    {iconUrl ? (
                        <img src={iconUrl} alt="Rocket" className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-9xl">🚀</span>
                    )}
                </div>
                <div className="mt-8 text-white text-2xl font-bold tracking-widest animate-pulse">LAUNCHING...</div>
            </div>
        </div>
    );
}

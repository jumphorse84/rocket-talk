import React, { useState } from 'react';
import { Sparkles, Star, Ticket, Quote, Gift, Backpack, CheckCircle, Pencil, MailOpen } from 'lucide-react';

export default function MessageBubble({ message, isMe, onRequestDelivery, onSubmitFeedback, allParcels, currentMode, onOpenJournal, onWriteJournal, couriers, staffList }) {
    let timeString = "";
    try { if (message.createdAt?.seconds) { timeString = new Date(message.createdAt.seconds * 1000).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }); } } catch { timeString = ""; }
    const textContent = typeof message.text === 'string' ? message.text : String(message.text || "");
    const [rating, setRating] = useState(5); const [feedbackText, setFeedbackText] = useState(""); const [isSubmitted, setIsSubmitted] = useState(false);

    if (message.kind === 'ASSIGNMENT') { return (<div className="flex justify-center py-4 px-2 w-full"><div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-lg max-w-[90%] w-full overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-300"><div className="w-16 h-16 rounded-full border-4 border-emerald-50 mb-3 overflow-hidden shadow-sm"><img src={message.courierPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.courierName}`} className="w-full h-full object-cover" /></div><h3 className="text-emerald-700 font-bold text-sm mb-1">{message.courierName} 기사가 배정되었습니다!</h3><p className="text-slate-500 text-xs mb-3">"안전하게 배송해 드릴게요 🚚"</p><div className="bg-emerald-50 px-3 py-2 rounded-lg text-emerald-600 text-[10px] font-bold">1:1 배송 전용 대화방이 시작됩니다.</div></div></div>); }
    if (message.kind === 'COMPLETION_REVIEW') { const targetParcel = allParcels?.find(p => p.id === message.parcelId); const alreadyRated = targetParcel?.rating !== undefined; const isStudent = currentMode === 'STUDENT'; if (isStudent) { const hasJournal = targetParcel?.journal; return (<div className="flex justify-center py-4 px-2 w-full"><div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-[95%] w-full text-center"><div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-full text-slate-400 mb-3"><CheckCircle size={24} className="text-emerald-500" /></div><h3 className="text-sm font-bold text-slate-800">배송이 완료되었습니다!</h3>{hasJournal ? (<p className="text-xs text-slate-500 mt-2">✅ 배송 일지를 성공적으로 보냈습니다.</p>) : (<div className="mt-4 animate-in fade-in slide-in-from-bottom-2"><p className="text-xs text-slate-500 mb-3">오늘 배송은 어땠나요? 선생님께 이야기를 남겨보세요.</p><button onClick={() => onWriteJournal && targetParcel && onWriteJournal(targetParcel)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-xs flex items-center justify-center gap-2"><Pencil size={14} /> 배송 일지 쓰고 초대장 보내기</button></div>)}{!hasJournal && <p className="text-[10px] text-slate-400 mt-3">선생님의 소중한 후기도 기다리고 있습니다 ⏳</p>}</div></div>); } return (<div className="flex justify-center py-4 px-2 w-full"><div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-lg max-w-[95%] w-full overflow-hidden"><div className="text-center mb-4"><div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full text-indigo-600 mb-2"><CheckCircle size={24} /></div><h3 className="text-sm font-bold text-slate-800">배송이 완료되었습니다!</h3><p className="text-xs text-slate-500 mt-1">{message.courierName} 기사님에게 칭찬을 남겨주세요</p></div>{alreadyRated || isSubmitted ? (<div className="bg-slate-50 p-4 rounded-xl text-center"><div className="flex justify-center gap-1 mb-2">{[...Array(targetParcel?.rating || rating)].map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}</div><p className="text-xs text-slate-600 font-medium">"{targetParcel?.feedback || feedbackText || "감사합니다!"}"</p><p className="text-[10px] text-slate-400 mt-2">소중한 피드백이 전달되었습니다 💌</p></div>) : (<div className="space-y-4"><div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform active:scale-125"><Star size={28} className={`${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} /></button>))}</div><textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="기사님에게 따뜻한 한마디를 남겨주세요..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:border-indigo-500 outline-none resize-none h-20" /><button onClick={() => { if (onSubmitFeedback && message.parcelId) { onSubmitFeedback(message.parcelId, rating, feedbackText); setIsSubmitted(true); } }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md active:scale-95">칭찬 보내기</button></div>)}</div></div>); }
    if (message.kind === 'JOURNAL') { return (<div className="flex justify-center py-6 px-2 w-full"><div onClick={() => onOpenJournal && onOpenJournal(textContent, `${message.courierName} 학생의 배송 일지`)} className="relative w-full max-w-[300px] bg-white rounded-lg shadow-xl border-4 border-amber-100 overflow-hidden cursor-pointer hover:scale-105 transition-transform group"><div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-amber-50 to-white clip-path-envelope"></div><div className="p-8 flex flex-col items-center text-center relative z-10"><div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3 shadow-md group-hover:bg-amber-200 transition-colors border-2 border-white"><MailOpen size={24} /></div><div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2"><span className="text-[10px] font-bold text-amber-700 tracking-widest uppercase">Invitation</span></div><h3 className="font-bold text-slate-800 text-base mb-1 font-serif">배송 일지 도착</h3><p className="text-xs text-slate-500 mb-4 font-serif italic">"{message.courierName}" 기사님이 보낸<br />마음을 확인해보세요.</p><button className="text-xs font-bold text-white bg-amber-500 px-6 py-2 rounded-full shadow-md hover:bg-amber-600 transition-colors">봉투 열어보기</button></div><div className="absolute top-4 left-4 text-amber-300 opacity-50"><Sparkles size={16} /></div><div className="absolute bottom-4 right-4 text-amber-300 opacity-50"><Sparkles size={16} /></div><div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-16 h-16 bg-red-800 rounded-full shadow-lg flex items-center justify-center border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"><span className="text-white font-serif font-bold italic text-sm">Open</span></div></div></div>); }

    if (message.kind === 'GIFT') {
        return (
            <div className="flex justify-center py-6 px-2 w-full">
                <div className="relative bg-white rounded-3xl p-6 shadow-xl max-w-[320px] w-full overflow-hidden text-center border border-rose-100 transform hover:scale-105 transition-transform duration-500 group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400 animate-gradient-x"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-50 rounded-full opacity-50 blur-2xl"></div>
                    <div className="absolute top-20 -left-10 w-24 h-24 bg-orange-50 rounded-full opacity-50 blur-xl"></div>
                    <div className="absolute top-4 right-6 text-yellow-400 animate-pulse"><Sparkles size={14} /></div>
                    <div className="absolute bottom-6 left-6 text-yellow-400 animate-pulse delay-700"><Sparkles size={10} /></div>

                    <div className="relative z-10">
                        <div className="inline-block relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border-2 border-white">
                                <span className="text-4xl filter drop-shadow-sm animate-bounce">🎁</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                GIFT
                            </div>
                        </div>

                        <h3 className="text-rose-600 font-bold text-sm mb-1 tracking-tight">선생님의 마음이 도착했습니다!</h3>
                        <div className="my-3 py-2 border-y border-rose-50">
                            <p className="text-slate-800 font-black text-xl leading-tight">{message.itemName}</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 mb-4">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">🏫</div>
                                <span className="text-xs font-bold text-slate-700">{message.senderName} 선생님</span>
                            </div>
                            <p className="text-[10px] text-slate-500">"오늘 하루도 정말 고생 많았어!<br />작은 선물이니 맛있게 먹으렴~ 😊"</p>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-rose-400 bg-rose-50 py-1.5 px-3 rounded-full inline-flex font-bold">
                            <Backpack size={10} />
                            <span>내 배낭에 자동 보관되었습니다</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (message.kind === 'NOTICE') { const targetParcel = allParcels?.find(p => p.id === message.parcelId); const isRequested = targetParcel && targetParcel.status !== 'PENDING'; const isUrgent = targetParcel?.isUrgent; return (<div className="flex justify-center py-4 px-2 w-full"><div className={`bg-white border rounded-2xl p-0 shadow-lg max-w-[95%] w-full overflow-hidden ${isUrgent ? 'border-red-200' : 'border-indigo-100'}`}><div className={`${isUrgent ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'} px-4 py-3 border-b flex items-center justify-center`}><h3 className={`text-sm font-bold flex items-center gap-2 ${isUrgent ? 'text-red-700' : 'text-indigo-800'}`}><span className="text-base">{isUrgent ? '🚨' : '🔔'}</span> {isUrgent ? '긴급 배송 요청됨!' : '택배 도착 알림'}<span className="text-base">🚀</span></h3></div><div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap text-center">{typeof message.text === 'string' ? message.text : String(message.text || "")}</div>{message.parcelId && onRequestDelivery && (<div className="px-5 pb-5 space-y-2">{isRequested ? (<button disabled className={`flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl transition-all shadow-none cursor-not-allowed ${isUrgent ? 'bg-red-100 text-red-400' : 'bg-slate-100 text-slate-400'}`}>{isUrgent ? "🚨 긴급 배송 요청 완료" : "✅ 배송 신청이 완료되었습니다"}</button>) : (<div className="flex gap-2"><button onClick={() => onRequestDelivery(message.parcelId, false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-xs flex flex-col items-center justify-center gap-1"><span>🚀 일반 배송</span><span className="text-[10px] font-normal opacity-80">순차적 배송</span></button><button onClick={() => onRequestDelivery(message.parcelId, true)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-xs flex flex-col items-center justify-center gap-1 animate-pulse hover:animate-none"><span>🚨 긴급 배송</span><span className="text-[10px] font-normal opacity-80">우선 처리 요청</span></button></div>)}</div>)}</div></div>); }
    if (message.senderType === "SYSTEM") { return (<div className="flex justify-center py-3 px-4"><div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-sm"><div className="text-xs text-slate-500 font-medium text-center">{textContent}</div></div></div>); }
    if (message.kind === 'FEEDBACK') { return (<div className="flex justify-center py-6 px-2 w-full"><div className="relative w-full max-w-[90%] bg-white rounded-3xl shadow-xl border-2 border-amber-300 overflow-hidden transform hover:scale-105 transition-transform duration-300"><div className="h-3 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"></div><div className="p-6 text-center relative"><div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"><div className="absolute top-2 left-2"><Sparkles size={24} /></div><div className="absolute bottom-2 right-2"><Sparkles size={24} /></div><div className="absolute top-10 right-10"><Star size={20} /></div></div><div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full text-amber-600 mb-3 shadow-sm border border-amber-200"><Ticket size={24} /></div><h3 className="text-amber-600 font-black text-lg mb-1 tracking-tight">SPECIAL THANKS</h3><p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-widest">Delivery Completed</p><div className="flex justify-center gap-2 mb-4 animate-in zoom-in duration-500 delay-100">{[...Array(message.rating || 5)].map((_, i) => (<Star key={i} size={24} className="fill-amber-400 text-amber-400 drop-shadow-sm" />))}</div><div className="relative"><Quote size={20} className="absolute -top-3 -left-2 text-amber-200 fill-amber-200 transform -scale-x-100" /><p className="text-slate-700 font-bold text-sm leading-relaxed px-4 py-2">{message.text}</p><Quote size={20} className="absolute -bottom-3 -right-2 text-amber-200 fill-amber-200" /></div><div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400"><span>From. {message.senderName || "선생님"}</span><span className="flex items-center gap-1"><Gift size={10} /> + 포인트 지급됨</span></div></div><div className="absolute -bottom-2 -left-2 w-4 h-4 bg-slate-100 rounded-full"></div><div className="absolute -bottom-2 -right-2 w-4 h-4 bg-slate-100 rounded-full"></div></div></div>); }
    const renderAvatar = () => {
        if (isMe || !message.senderName) return null;
        let photoUrl = "";
        if (message.senderType === 'STUDENT' && couriers) {
            photoUrl = couriers.find(c => (c.name || '').trim() === (message.senderName || '').trim())?.photoUrl;
        } else if (message.senderType === 'TEACHER' && staffList) {
            photoUrl = staffList.find(s => (s.name || '').trim() === (message.senderName || '').trim())?.photoUrl;
        }
        
        return (
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 bg-slate-100 border border-slate-200">
                {photoUrl ? (
                    <img src={photoUrl} alt={message.senderName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                        {message.senderName[0]}
                    </div>
                )}
            </div>
        );
    };

    return (<div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}><div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full gap-2`}>{!isMe && renderAvatar()}<div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>{!isMe && message.senderName && <span className="text-[10px] text-slate-500 mb-1 ml-1">{message.senderName}</span>}<div className="flex items-end gap-1.5"><div className={`px-4 py-2.5 text-sm leading-snug shadow-sm whitespace-pre-wrap rounded-2xl ${isMe ? 'bg-[#fee500] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'}`}>{textContent}</div><span className="text-[10px] text-slate-400 shrink-0 mb-1">{timeString}</span></div></div></div></div>);
}

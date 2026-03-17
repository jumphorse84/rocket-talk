/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { BookOpen, X, Sparkles } from "lucide-react";
import { callGemini } from "../utils";

export default function CourierJournalModal({ isOpen, onClose, onSave, parcel }) {
  const [text, setText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText(parcel?.journal || "");
      setAiSuggestion([]);
    }
  }, [isOpen, parcel]);

  const handleAiHelp = async () => {
    if (!parcel) return;
    setIsLoadingAi(true);
    const prompt = `초등학생/중학생이 학교에서 봉사활동으로 배송을 완료하고 쓰는 짧은 일기(1~2문장)를 3가지 추천해줘. 상황: '${parcel.receiver}' 선생님께 '${parcel.itemName}'을(를) 배송함. 말투: 해요체, 뿌듯하고 긍정적인 말투. 형식: 번호 없이 문장만 3줄로 출력해줘.`;
    try {
      const result = await callGemini(prompt);
      const suggestions = result.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
      setAiSuggestion(suggestions.length > 0 ? suggestions : ["선생님께 물건을 잘 전달해 드려서 뿌듯했다!", "배송을 완료하고 나니 기분이 상쾌하다."]);
    } catch {
      setAiSuggestion(["오늘 배송도 무사히 마쳐서 정말 기쁘다!", "선생님께서 고맙다고 하셔서 기분이 좋았다.", "빠르고 정확하게 배달하는 멋진 기사가 된 것 같다."]);
    }
    setIsLoadingAi(false);
  };

  if (!isOpen || !parcel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" /> 배송 일지 쓰기
          </h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs text-slate-500">
          <span className="font-bold text-slate-700">{parcel.receiver} 선생님</span>께 <span className="font-bold text-slate-700"> {parcel.itemName}</span> 배송 완료!
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none resize-none mb-3"
          placeholder="오늘 배송은 어땠나요? 기록으로 남겨보세요!"
        />
        <div className="mb-4">
          <button
            onClick={handleAiHelp}
            disabled={isLoadingAi}
            className="flex items-center justify-center gap-1 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Sparkles size={12} /> {isLoadingAi ? "지니 선생님이 생각중..." : "어떻게 쓸지 모르겠어요 (AI 추천)"}
          </button>
          {aiSuggestion.length > 0 && (
            <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
              <p className="text-[10px] text-slate-400 text-center">마음에 드는 문장을 누르면 입력됩니다!</p>
              {aiSuggestion.map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(sugg.replace(/^\d+\.\s*/, '').replace(/["']/g, ""))}
                  className="w-full text-left p-2 bg-white border border-indigo-100 rounded-lg text-xs text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                >
                  {sugg.replace(/^\d+\.\s*/, '').replace(/["']/g, "")}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onSave(text)}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700"
        >
          저장 및 초대장 전송
        </button>
      </div>
    </div>
  );
}

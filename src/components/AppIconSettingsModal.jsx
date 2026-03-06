import React, { useState } from "react";
import { X, Image as ImageIcon, Upload, Save } from "lucide-react";
import { compressImage } from "../utils";

export default function AppIconSettingsModal({ isOpen, onClose, currentIcon, onSave }) {
    const [preview, setPreview] = useState(currentIcon);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    React.useEffect(() => {
        setPreview(currentIcon);
    }, [currentIcon]);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            setIsProcessing(true);
            try {
                const compressed = await compressImage(e.target.files[0]);
                setPreview(compressed);
                setSelectedFile(compressed);
            } catch (error) {
                console.error("Image processing failed", error);
                alert("이미지 처리 중 오류가 발생했습니다.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleSave = () => {
        if (preview) {
            onSave(preview);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="text-indigo-600" /> 앱 아이콘 설정
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 flex flex-col items-center">
                    <p className="text-sm text-slate-500 mb-4 text-center">
                        앱 내에서 표시될 로고 아이콘을 변경합니다.<br />
                        <span className="text-xs text-rose-500">* 데스크톱 바탕화면 아이콘은 앱 재설치 시 업데이트됩니다.</span>
                    </p>

                    <div className="relative w-32 h-32 mb-6 group cursor-pointer" onClick={() => document.getElementById('icon-upload').click()}>
                        <div className={`w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-white ${!preview && 'bg-slate-200'}`}>
                            {preview ? (
                                <img src={preview} alt="App Icon" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">🚀</span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="text-white" />
                        </div>
                    </div>

                    <input
                        id="icon-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <button
                        onClick={() => document.getElementById('icon-upload').click()}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        disabled={isProcessing}
                    >
                        {isProcessing ? "처리중..." : "이미지 선택"}
                    </button>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors">
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        <Save size={16} /> 저장
                    </button>
                </div>
            </div>
        </div>
    );
}

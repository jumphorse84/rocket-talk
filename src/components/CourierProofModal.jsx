import React, { useState, useRef, useEffect } from "react";
import { PenTool, Camera, RotateCcw } from "lucide-react";
import { compressImage } from "../utils";

export default function CourierProofModal({ isOpen, onClose, onComplete, receiverName }) {
    const [mode, setMode] = useState("SELECT");
    const [photoUrl, setPhotoUrl] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const endDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) setSignatureUrl(canvas.toDataURL("image/png"));
    };

    const getCoordinates = (e, canvas) => {
        if ('touches' in e) {
            const rect = canvas.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                offsetX: e.nativeEvent.offsetX,
                offsetY: e.nativeEvent.offsetY
            };
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setSignatureUrl(null);
        }
    };

    const handlePhotoCapture = async (e) => {
        if (e.target.files?.[0]) {
            try {
                const compressed = await compressImage(e.target.files[0], 300, 0.6);
                setPhotoUrl(compressed);
            } catch (error) {
                console.error("Photo processing failed", error);
            }
        }
    };

    const handleSubmit = () => {
        if (mode === "SIGNATURE" && signatureUrl) {
            onComplete("SIGNATURE", signatureUrl);
        } else if (mode === "PHOTO" && photoUrl) {
            onComplete("PHOTO", photoUrl);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setMode("SELECT");
            setPhotoUrl(null);
            setSignatureUrl(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-center">배송 완료 인증</h3>
                {mode === "SELECT" && (
                    <>
                        <p className="text-sm text-slate-500 text-center mb-6">{receiverName} 선생님께 전달했나요?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setMode("SIGNATURE")} className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors">
                                <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700">
                                    <PenTool size={20} />
                                </div>
                                <span className="text-xs font-bold text-indigo-700">선생님 서명</span>
                            </button>
                            <button onClick={() => setMode("PHOTO")} className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-colors">
                                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                                    <Camera size={20} />
                                </div>
                                <span className="text-xs font-bold text-emerald-700">인증샷 촬영</span>
                            </button>
                        </div>
                    </>
                )}
                {mode === "SIGNATURE" && (
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-slate-400 text-center">아래 공간에 서명을 해주세요</p>
                        <div className="border-2 border-dashed border-indigo-200 rounded-xl overflow-hidden touch-none">
                            <canvas
                                ref={canvasRef}
                                width={300}
                                height={150}
                                className="w-full bg-white touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={endDrawing}
                                onMouseLeave={endDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={endDrawing}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={clearSignature} className="flex-1 py-2 text-xs text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200">
                                <RotateCcw size={14} className="inline mr-1" />지우기
                            </button>
                            <button onClick={handleSubmit} disabled={!signatureUrl} className="flex-[2] py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                완료 및 저장
                            </button>
                        </div>
                    </div>
                )}
                {mode === "PHOTO" && (
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-slate-400 text-center">전달 완료 사진을 찍어주세요</p>
                        <div
                            className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-emerald-200 cursor-pointer relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {photoUrl ? (
                                <img src={photoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-emerald-400">
                                    <Camera size={32} className="mx-auto mb-1" />
                                    <span className="text-xs">눌러서 촬영하기</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoCapture} />
                        </div>
                        <button onClick={handleSubmit} disabled={!photoUrl} className="w-full py-3 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            완료 및 저장
                        </button>
                    </div>
                )}
                <button onClick={onClose} className="mt-4 w-full py-3 text-slate-400 text-xs hover:text-slate-600 border-t border-slate-100">
                    취소/닫기
                </button>
            </div>
        </div>
    );
}

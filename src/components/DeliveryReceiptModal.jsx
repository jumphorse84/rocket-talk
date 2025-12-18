import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Settings, User, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} props.onNext
 * @param {Object} props.parcel
 * @param {string} props.proofUrl
 * @param {Object} [props.courier]
 */
const DeliveryReceiptModal = ({ isOpen, onClose, onNext, parcel, proofUrl, courier }) => {
    const [logoSrc, setLogoSrc] = useState("/rocket_flex_logo.png");
    const [proofSrc, setProofSrc] = useState(proofUrl || "");
    const [courierSrc, setCourierSrc] = useState(courier?.photoUrl || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const receiptRef = useRef(null);

    // Default dimensions (square 10x10cm approx)
    const [customDimsMm, setCustomDimsMm] = useState({ width: 100, height: 100 });
    const MM_TO_PX = 3.78; // 1mm = 3.78px at 96dpi

    useEffect(() => {
        // Data Debugging
        console.log("DeliveryReceiptModal Props:", {
            hasCourier: !!courier,
            courierName: courier?.name,
            courierPhoto: courier?.photoUrl,
            proofUrl
        });

        const convertToBase64 = async (url) => {
            if (!url) return "";
            if (url.startsWith("data:")) return url; // Already base64
            try {
                const response = await fetch(url, { mode: 'cors' });
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn("Image to Base64 failed for:", url, e);
                return url; // Fallback to original URL
            }
        };

        // Convert images to base64 for reliable capture
        convertToBase64("/rocket_flex_logo.png").then(setLogoSrc);
        if (proofUrl) convertToBase64(proofUrl).then(setProofSrc);
        if (courier?.photoUrl) convertToBase64(courier.photoUrl).then(setCourierSrc);
        else setCourierSrc(""); // Reset if no courier photo

    }, [proofUrl, courier]);

    const handlePrint = async () => {
        if (!receiptRef.current) return;
        setIsGenerating(true);

        // 1. Open window immediately
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert("팝업 차단이 감지되었습니다. 팝업을 허용해 주세요.");
            setIsGenerating(false);
            return;
        }

        // 2. Setup the Skeleton (Single Write)
        try {
            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>인수증 출력</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #eee; font-family: sans-serif; }
                        #loader { text-align: center; }
                        #preview-image { max-width: 100%; height: auto; border: 1px solid #ccc; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: none; }
                        #error-msg { color: red; text-align: center; display: none; }
                        @media print {
                            body { background: white; margin: 0; }
                            #loader, #error-msg { display: none !important; }
                            #preview-image { border: none; width: 100%; max-width: none; box-shadow: none; display: block !important; }
                            @page { size: auto; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div id="loader">
                        <h2 style="margin-bottom:10px;">🖨️ 인수증을 생성하고 있습니다...</h2>
                        <p style="color:#666;font-size:12px;">잠시만 기다려주세요.</p>
                    </div>
                    <div id="error-msg">
                        <h2>⚠️ 출력 오류 발생</h2>
                        <p id="error-text"></p>
                        <button onclick="window.close()" style="margin-top:20px;padding:8px 16px;cursor:pointer;">창 닫기</button>
                    </div>
                    <img id="preview-image" alt="Receipt Preview" />
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (e) {
            console.error("Failed to setup print window", e);
            printWindow.close();
            alert("인쇄 창을 열 수 없습니다.");
            setIsGenerating(false);
            return;
        }

        try {
            // 3. Generate Image
            const canvas = await html2canvas(receiptRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
            });
            const image = canvas.toDataURL("image/png");

            // 4. Update the Waiting Window
            if (printWindow && !printWindow.closed) {
                const loader = printWindow.document.getElementById('loader');
                const img = printWindow.document.getElementById('preview-image');

                if (loader && img) {
                    loader.style.display = 'none';
                    img.src = image;
                    img.style.display = 'block';

                    // Small delay to ensure image render before print dialog
                    img.onload = () => {
                        setTimeout(() => {
                            printWindow.focus();
                            printWindow.print();
                        }, 500);
                    };
                    // Fallback
                    if (img.complete) {
                        setTimeout(() => {
                            printWindow.focus();
                            printWindow.print();
                        }, 500);
                    }
                }
            }

        } catch (err) {
            console.error("Print generation failed", err);
            if (printWindow && !printWindow.closed) {
                const loader = printWindow.document.getElementById('loader');
                const errorMsg = printWindow.document.getElementById('error-msg');
                const errorText = printWindow.document.getElementById('error-text');

                if (loader) loader.style.display = 'none';
                if (errorMsg) errorMsg.style.display = 'block';
                if (errorText) errorText.textContent = err.message || "알 수 없는 오류";
            } else {
                alert("출력 중 오류가 발생했습니다.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const containerStyle = {
        width: `${customDimsMm.width * MM_TO_PX}px`,
        height: `${customDimsMm.height * MM_TO_PX}px`,
        backgroundColor: 'white',
        border: '2px solid black',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        color: 'black'
    };

    const rowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid black',
        padding: '8px 0',
        fontSize: '12px'
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Controller */}
                <div className="bg-slate-50 p-6 flex flex-col gap-6 md:w-80 border-r border-slate-200 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Settings size={20} /> 설정
                        </h2>
                        <button onClick={onClose} className="md:hidden p-2"><X size={20} /></button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-lg">
                            <label className="text-xs font-bold text-slate-500 mb-3 block">용지 크기 (mm)</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <span className="text-[10px] text-slate-400 block mb-1">가로</span>
                                    <input
                                        type="number"
                                        value={customDimsMm.width}
                                        onChange={e => setCustomDimsMm(p => ({ ...p, width: Number(e.target.value) }))}
                                        className="w-full border p-2 rounded text-center font-mono text-sm"
                                    />
                                </div>
                                <span className="pt-4">x</span>
                                <div className="flex-1">
                                    <span className="text-[10px] text-slate-400 block mb-1">세로</span>
                                    <input
                                        type="number"
                                        value={customDimsMm.height}
                                        onChange={e => setCustomDimsMm(p => ({ ...p, height: Number(e.target.value) }))}
                                        className="w-full border p-2 rounded text-center font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                        <p className="text-xs text-slate-400 text-center">미리보기가 실제 출력물입니다.</p>
                        <button onClick={handlePrint} disabled={isGenerating} className="w-full py-3 bg-black text-white font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-slate-800">
                            {isGenerating ? '생성 중...' : <><Printer size={18} /> 출력하기</>}
                        </button>
                        <button onClick={onNext} className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50">
                            닫기
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center items-start custom-scrollbar">
                    <div ref={receiptRef} style={containerStyle}>
                        {/* Header - Compact */}
                        <div className="text-center mb-2 pb-2" style={{ borderBottom: '1px solid black' }}>
                            {/* Logo */}
                            <img
                                src={logoSrc}
                                alt="Rocket Flex"
                                className="h-[50px] mx-auto mb-1 object-contain grayscale"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <h1 className="text-sm font-black uppercase tracking-wide m-0">DELIVERY RECEIPT</h1>
                            <p className="text-[8px] mt-0.5" style={{ color: '#64748b' }}>
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        {/* Body - Compact */}
                        <div className="flex-1 flex flex-col">
                            <div style={{ ...rowStyle, padding: '4px 0', fontSize: '10px' }}>
                                <span className="font-bold">받는 분</span>
                                <span>{parcel.receiver}</span>
                            </div>
                            <div style={{ ...rowStyle, padding: '4px 0', fontSize: '10px' }}>
                                <span className="font-bold">장소</span>
                                <span>{parcel.location}</span>
                            </div>
                            <div style={{ ...rowStyle, padding: '4px 0', fontSize: '10px' }}>
                                <span className="font-bold">물품</span>
                                <span>{parcel.itemName}</span>
                            </div>

                            {/* Proof Image - Smaller */}
                            <div className="mt-2 h-[80px] relative flex items-center justify-center overflow-hidden" style={{ border: '1px solid black', backgroundColor: '#f8fafc' }}>
                                {proofSrc ? (
                                    <img src={proofSrc} className="max-w-full max-h-[80px] object-contain grayscale opacity-90" />
                                ) : (
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>사진 없음</span>
                                )}
                                <div className="absolute bottom-0.5 right-0.5 px-1.5 py-0.5 text-[7px] font-black rotate-[-10deg]" style={{ border: '1px solid black', backgroundColor: '#ffffff' }}>
                                    CONFIRMED
                                </div>
                            </div>

                            {/* Courier Info - Compact */}
                            <div className="mt-2 flex items-center gap-2 pt-2" style={{ borderTop: '1px solid black' }}>
                                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e2e8f0', border: '1px solid black' }}>
                                    {courierSrc ? (
                                        <img src={courierSrc} className="w-full h-full object-cover grayscale" />
                                    ) : (
                                        <User size={16} color="#000000" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold uppercase leading-tight">Delivery Partner</p>
                                    <p className="text-[10px] font-bold leading-tight">{courier?.name || parcel.courierName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Compact */}
                        <div className="mt-2 text-center text-[7px] leading-tight" style={{ color: '#94a3b8' }}>
                            위와 같이 배송이 완료되었음을 확인합니다.<br />
                            Rocket Flex Logistics System
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryReceiptModal;

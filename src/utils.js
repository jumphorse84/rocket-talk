import { LOGIN_STORAGE_KEY } from './data';

export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scaleSize = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                } else {
                    reject(new Error("Canvas context failed"));
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const callGemini = async (prompt) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (prompt.includes("감사 메시지")) {
        return "선생님, 따뜻한 마음 감사드립니다! 덕분에 잘 받았습니다. 오늘도 행복한 하루 보내세요! 😊";
    }
    return "선생님께 물건을 잘 전달해 드려서 뿌듯했다!\n배송을 완료하고 나니 기분이 상쾌하다.\n오늘도 안전하게 배달 완료!";
};

export const getSeconds = (t) => {
    if (!t) return Date.now() / 1000;
    if (t.seconds) return t.seconds;
    if (t instanceof Date) return t.getTime() / 1000;
    if (typeof t === 'number') return t / 1000;
    return 0;
};

export function loadSavedLogin() {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(LOGIN_STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return { name: data.name, role: data.role, mode: data.mode };
    } catch { return null; }
}

export function saveLogin(name, role, mode) {
    try { window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify({ name, role, mode })); } catch { }
}

export function clearLogin() {
    try { window.localStorage.removeItem(LOGIN_STORAGE_KEY); } catch { }
}

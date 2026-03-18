import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Home, MessageCircle, User, Bell, Package, Truck, Send, CheckCircle,
  LogOut, MapPin, Clock, Sparkles, X, Plus, Camera, ClipboardList,
  Lock, Search, Filter, ArrowLeft, Trash2, ChevronRight, ExternalLink,
  Pencil, AlertCircle, Settings, PenTool, CheckSquare, BookOpen,
  Image as ImageIcon, RotateCcw, ChevronDown, Calendar, Star, ThumbsUp, Quote,
  Save, Users, Trophy, Award, Crown, Zap, Layout, Heart, MessageSquare, Siren,
  ClipboardCheck, Building, ShoppingBag, Coins, Gift, Cloud, Ticket, Check,
  Mail, MessageCircle as MessageIcon, MailOpen, Info, Backpack, History,
  Rocket, Download
} from "lucide-react";
import CourierJournalModal from './components/CourierJournalModal';
import CourierProofModal from './components/CourierProofModal';
import AddCourierModal from './components/AddCourierModal';
import AddStaffModal from './components/AddStaffModal';
import ManageShopModal from './components/ManageShopModal';
import AppIconSettingsModal from './components/AppIconSettingsModal';
import RocketBackpackModal from './components/RocketBackpackModal';
import GiftStudentModal from './components/GiftStudentModal';
import LaunchAnimation from './components/LaunchAnimation';
import SpaceBackground from './components/SpaceBackground';
import StatsInfoModal from './components/StatsInfoModal';
import RocketShopModal from './components/RocketShopModal';
import ParcelStatusModal from './components/ParcelStatusModal';
import CourierProfileModal from './components/CourierProfileModal';
import StaffProfileModal from './components/StaffProfileModal';
import WritePostModal from './components/WritePostModal';
import NotificationToast from './components/NotificationToast';
import ConfirmModal from './components/ConfirmModal';
import ParcelStatusBadge from './components/ParcelStatusBadge';
import MessageBubble from './components/MessageBubble';
import RegisterParcelModal from './components/RegisterParcelModal';
import DeliveryChecklistModal from './components/DeliveryChecklistModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import JournalViewModal from './components/JournalViewModal';
import AiThankYouModal from './components/AiThankYouModal';
import CompletedHistoryModal from './components/CompletedHistoryModal';
import DeliveryReceiptModal from './components/DeliveryReceiptModal';
import LeaderboardModal from './components/LeaderboardModal';
import confetti from 'canvas-confetti';
import { LOGIN_STORAGE_KEY, TIME_SLOTS, LEVEL_THRESHOLDS, DEFAULT_SHOP_ITEMS, initialStaff, STAFF_LOCATIONS } from './data';
import { compressImage, callGemini, getSeconds, loadSavedLogin, saveLogin, clearLogin, requestNotificationPermission, sendPushNotification } from './utils';

// ---- Firebase Imports ----
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore, collection, doc, setDoc, onSnapshot, query,
  serverTimestamp, deleteDoc, getDocs, updateDoc, orderBy, addDoc, getDoc
} from "firebase/firestore";

// ---- Firebase Configuration ----
// ---- Firebase Configuration ----
const firebaseConfig = {
  apiKey: "AIzaSyA0lBLGVAOn3Za6iCVwScU2VgIj1SA5Q1g",
  authDomain: "rocket-talk-efe0d.firebaseapp.com",
  projectId: "rocket-talk-efe0d",
  storageBucket: "rocket-talk-efe0d.firebasestorage.app",
  messagingSenderId: "241841891200",
  appId: "1:241841891200:web:397fcf9d710048edf4c365",
  measurementId: "G-1GKGX8LS8E"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "rocket-talk-default"; // Using fixed app ID for consistency
const PUBLIC_CHAT_ID = "public_chat";





// ---- Types ----
type LoginMode = "ADMIN" | "TEACHER" | "STUDENT";
type ParcelStatus = "PENDING" | "WAITING" | "DELIVERING" | "COMPLETED";


type Parcel = {
  id?: string;
  itemName: string;
  sender: string;
  receiver: string;
  receiverId: string;
  arrivedAt: string;
  status: ParcelStatus;
  location: string;
  createdAt: any;
  courierName?: string;
  courierId?: string;
  proofType?: "SIGNATURE" | "PHOTO";
  proofImage?: string;
  journal?: string;
  rating?: number;
  feedback?: string;
  isUrgent?: boolean;
};
export type Staff = {
  id: string;
  name: string;
  role: string;
  location: string;
  isOnline: boolean;
  photoUrl?: string;
  description?: string;
  points?: number;
};

export type Message = {
  id?: string;
  targetId: string;
  channelId?: string;
  senderType: "SYSTEM" | "TEACHER" | "STUDENT" | "ADMIN";
  senderName?: string;
  text: string;
  createdAt: any;
  kind?: "FEEDBACK" | "STATUS" | "NOTICE" | "ASSIGNMENT" | "COMPLETION_REVIEW" | "JOURNAL" | "JOURNAL_INVITE" | "GIFT" | "CHAT";
  parcelId?: string;
  itemName?: string;
  imageUrl?: string;
  senderId?: string;
};
export type InventoryItem = {
  id: string;
  itemId: string;
  name: string;
  icon: string;
  price: number;
  purchasedAt: any;
  isUsed: boolean;
  giftedBy?: string; // Teacher who gifted it
};

export type Courier = {
  id: string;
  name: string;
  isOnline: boolean;
  points?: number;
  photoUrl?: string;
  description?: string;
  inventory?: InventoryItem[];
  availableSlots: string[];
  createdAt?: any;
};

type Post = {
  id: string;
  authorName: string;
  authorRole: string;
  targetCourierName: string;
  content: string;
  likes: string[];
  createdAt: any;
};

type Comment = {
  id: string;
  postId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: any;
};

// --- Gamification Effects ---
const fireBigConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#4f46e5', '#10b981', '#f59e0b']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ef4444', '#8b5cf6', '#3b82f6']
    });
  }, 250);
};

// ---- Components ----

// ---- 메인 앱 ----
export default function App() {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [mode, setMode] = useState<LoginMode>("TEACHER");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [input, setInput] = useState("");

  const [activeTab, setActiveTab] = useState<'HOME' | 'CHAT' | 'MYPAGE' | 'BOARD'>('HOME');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [loginSearch, setLoginSearch] = useState("");
  const [showLoginSuggestions, setShowLoginSuggestions] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierToEdit, setCourierToEdit] = useState<Courier | null>(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteParcelConfirm, setShowDeleteParcelConfirm] = useState(false);
  const [deleteParcelId, setDeleteParcelId] = useState<string | null>(null);

  const [showStaffEditModal, setShowStaffEditModal] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
  const [showDeleteStaffConfirmModal, setShowDeleteStaffConfirmModal] = useState(false);
  const [deleteStaffTargetId, setDeleteStaffTargetId] = useState<string | null>(null);

  const [studentName, setStudentName] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);
  const [targetParcelId, setTargetParcelId] = useState<string | null>(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTargetParcel, setJournalTargetParcel] = useState<Parcel | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allParcels, setAllParcels] = useState<Parcel[]>([]);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showShopManageModal, setShowShopManageModal] = useState(false);
  const [shopItems, setShopItems] = useState(DEFAULT_SHOP_ITEMS);
  const [selectedCourierProfile, setSelectedCourierProfile] = useState<Courier | null>(null);
  const [showWritePostModal, setShowWritePostModal] = useState(false);
  const [initialCourierName, setInitialCourierName] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [editProfile, setEditProfile] = useState<{ desc: string, slots: string[], photo: string }>({ desc: "", slots: [], photo: "" });
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistParcel, setChecklistParcel] = useState<Parcel | null>(null);
  const [showCompletedHistoryModal, setShowCompletedHistoryModal] = useState(false);
  const [showStatsInfoModal, setShowStatsInfoModal] = useState(false);
  const [journalViewData, setJournalViewData] = useState<{ open: boolean, text: string, title: string }>({ open: false, text: "", title: "" });
  const [showBackpackModal, setShowBackpackModal] = useState(false);

  const [showStaffProfileModal, setShowStaffProfileModal] = useState(false); // [상태 추가] 선생님 프로필 모달
  const [showIconSettingsModal, setShowIconSettingsModal] = useState(false);
  const [appSettings, setAppSettings] = useState<{ iconUrl?: string }>({});
  const [showLeaderboard, setShowLeaderboard] = useState(false); // Gamification Leaderboard
  const [hoveredCourier, setHoveredCourier] = useState<{ courier: any; stats: any; rect: DOMRect } | null>(null);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [arrivalParcels, setArrivalParcels] = useState<Parcel[]>([]);
  const arrivalShownRef = useRef(false);

  // [PWA 설치 유도용 State]
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // New States for Teacher Gifting
  const [giftTargetItem, setGiftTargetItem] = useState<any>(null);
  const [showGiftStudentModal, setShowGiftStudentModal] = useState(false);
  const [expandedCouriers, setExpandedCouriers] = useState<Record<string, boolean>>({});

  const toggleCourierGroup = (courierName: string) => {
    setExpandedCouriers(prev => ({ ...prev, [courierName]: !prev[courierName] }));
  };

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFromHistory, setReceiptFromHistory] = useState(false); // Track if receipt opened from history
  const [receiptData, setReceiptData] = useState<{
    parcel: Parcel;
    proofUrl: string;
    courier?: Courier; // Courier info for receipt
  } | null>(null);

  const stats = useMemo(() => ({
    total: allParcels.length,
    processing: allParcels.filter(p => p.status === 'DELIVERING').length,
    waiting: allParcels.filter(p => p.status === 'PENDING').length,
    delivered: allParcels.filter(p => p.status === 'COMPLETED').length,
  }), [allParcels]);

  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [openLocations, setOpenLocations] = useState<Record<string, boolean>>({});

  const filteredAndGroupedStaff = useMemo(() => {
    const query = staffSearchQuery.toLowerCase();
    const filtered = staffList.filter(s => s.id !== 'me' && (s.name.includes(query) || s.role.includes(query) || s.location.includes(query)));
    return STAFF_LOCATIONS.reduce((acc, loc) => {
      acc[loc] = filtered.filter(s => s.location.includes(loc));
      return acc;
    }, {} as Record<string, Staff[]>);
  }, [staffList, staffSearchQuery]);

  useEffect(() => {
    const initAuth = async () => {
      try { const token = (window as any).__initial_auth_token; if (token) { await signInWithCustomToken(auth, token); } else { await signInAnonymously(auth); } } catch (e) { console.error("Auth Error:", e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let isInitialMessageLoad = true;
    const msgQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
    const unsubMsg = onSnapshot(msgQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      msgs.sort((a, b) => getSeconds(a.createdAt) - getSeconds(b.createdAt));
      setMessages(msgs);

      if (!isInitialMessageLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const msg = change.doc.data() as Message;
            // 푸시 알림: 나에게 온 새로운 메시지나 선물인 경우
            if (msg.targetId === currentUser?.id || msg.targetId === PUBLIC_CHAT_ID) {
              if (msg.senderName !== name) { // 내가 보낸 메시지는 제외
                const title = msg.kind === 'GIFT' ? '🎁 새 선물이 도착했습니다!' : `💬 ${msg.senderName}님의 메시지`;
                sendPushNotification(title, { body: msg.text });
              }
            }
          }
        });
      }
      isInitialMessageLoad = false;
    });

    let isInitialParcelLoad = true;
    const parcelQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'parcels'));
    const unsubParcel = onSnapshot(parcelQuery, (snapshot) => {
      const parcels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parcel));
      parcels.sort((a, b) => getSeconds(b.createdAt) - getSeconds(a.createdAt));
      setAllParcels(parcels);

      if (!isInitialParcelLoad) {
        snapshot.docChanges().forEach((change) => {
          const parcelData = change.doc.data() as Parcel;

          if (change.type === "added" && parcelData.status === 'PENDING') {
            // 학생(기사) 모드일 때 새 택배가 등록되면 알림 (임시로 모두에게 알림)
            if (mode === 'STUDENT') {
              sendPushNotification(`📦 새 택배 호출: ${parcelData.receiver} 선생님`, { body: `위치: ${parcelData.location}\n물품: ${parcelData.itemName}` });
            }
          }

          if (change.type === "modified") {
            // 내 택배가 배송 완료되었을 때 선생님에게 알림
            if (mode === 'TEACHER' && parcelData.receiverId === currentUser?.id && parcelData.status === 'COMPLETED') {
              sendPushNotification(`✅ 택배 배송 완료!`, { body: `${parcelData.courierName} 기사님이 ${parcelData.itemName} 배송을 완료했습니다.` });
              fireBigConfetti();
            }
          }
        });
      }
      isInitialParcelLoad = false;
    });

    const courierQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'couriers'));
    const unsubCourier = onSnapshot(courierQuery, (snapshot) => { const loadedCouriers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Courier)); setCouriers(loadedCouriers); });


    // Custom staff logic: If active_users has staff that are not in initial staff list, add them here.
    const customStaffQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'custom_staff'));
    const unsubCustomStaff = onSnapshot(customStaffQuery, (snapshot) => {
      const allCustomStaff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isOnline: false }));
      // Merge initial staff with custom staff
      setStaffList(prev => {
        const baseStaff = initialStaff.filter(s => !allCustomStaff.find(c => c.id === s.id));
        const activeCustomStaff = allCustomStaff.filter(c => !c.deleted);
        return [...baseStaff, ...activeCustomStaff].map(s => {
          const data = activeDataRef.current?.[s.id];
          return { ...s, isOnline: !!data, photoUrl: data?.photoUrl || (s as any).photoUrl, description: data?.description || (s as any).description, points: data?.points || 0, name: data?.name || s.name, role: data?.role || s.role, location: data?.location || s.location } as Staff;
        });
      });
    });

    const postsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'posts'));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => { const loadedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)); loadedPosts.sort((a, b) => getSeconds(b.createdAt) - getSeconds(a.createdAt)); setPosts(loadedPosts); });
    const commentsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'comments'));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => { const loadedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)); loadedComments.sort((a, b) => getSeconds(a.createdAt) - getSeconds(b.createdAt)); setComments(loadedComments); });
    const shopDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'shop', 'list');
    const unsubShop = onSnapshot(shopDocRef, (snapshot) => { if (snapshot.exists() && snapshot.data().items) { setShopItems(snapshot.data().items); } else { setShopItems(DEFAULT_SHOP_ITEMS); } });

    // [앱 설정 구독]
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_settings', 'config');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.data());
      }
    });

    return () => { unsubMsg(); unsubParcel(); unsubCourier(); unsubCustomStaff(); unsubPosts(); unsubComments(); unsubShop(); unsubSettings(); };
  }, [user]);

  const activeDataRef = useRef<Record<string, any>>({});
  useEffect(() => {
    if (!user) return;
    const activeUsersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'active_users'));
    const unsub = onSnapshot(activeUsersQuery, (snapshot) => {
      activeDataRef.current = snapshot.docs.reduce((acc, doc) => { acc[doc.id] = doc.data(); return acc; }, {} as Record<string, any>);
      // Re-trigger staff list update by just referencing current staffList
      setStaffList(prev => prev.map(s => { const data = activeDataRef.current[s.id]; return { ...s, isOnline: !!data, photoUrl: data?.photoUrl || s.photoUrl, description: data?.description || s.description, points: data?.points || 0, name: data?.name || s.name, role: data?.role || s.role, location: data?.location || s.location }; }));
    });
    return () => unsub();
  }, [user]);

  // [Favicon 업데이트]
  useEffect(() => {
    if (appSettings?.iconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = appSettings.iconUrl;
    }
  }, [appSettings]);

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (activeTab === 'MYPAGE' && !hasChanges) {
      if (mode === 'STUDENT') { const myProfile = couriers.find(c => c.name === name); if (myProfile) { setEditProfile({ desc: myProfile.description || "", slots: myProfile.availableSlots || [], photo: myProfile.photoUrl || "" }); } } else if (mode === 'TEACHER') { const me = staffList.find(s => s.name === name); if (me) { setEditProfile({ desc: me.description || "", slots: [], photo: me.photoUrl || "" }); } }
    }
  }, [activeTab, mode, couriers, name, hasChanges, staffList]);

  // [택배 도착 알림] 로그인 직후 PENDING 파셀이 있으면 팝업 표시
  useEffect(() => {
    if (!loggedIn || mode !== 'TEACHER' || allParcels.length === 0) return;
    if (arrivalShownRef.current) return;
    const currentStaff = staffList.find(s => s.name === name);
    if (!currentStaff) return;
    const pending = allParcels.filter(p => p.receiverId === currentStaff.id && p.status === 'PENDING');
    if (pending.length > 0) {
      setArrivalParcels(pending);
      setShowArrivalPopup(true);
      arrivalShownRef.current = true;
    }
  }, [loggedIn, allParcels, mode, name, staffList]);

  // [PWA 설치 이벤트 등록 (전역 유지)]
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // [PWA 팝업 노출 및 App Badge 설정 (로그인 상태 의존)]
  useEffect(() => {
    if (loggedIn && mode === 'TEACHER') {
      // 설치 프롬프트가 대기 중이면 팝업 띄우기
      if (deferredPrompt) {
        setShowInstallPrompt(true);
      }

      // App Badge 업데이트
      const currentStaff = staffList.find(s => s.name === name);
      if (currentStaff) {
        const pendingCount = allParcels.filter(p => p.receiverId === currentStaff.id && p.status === 'PENDING').length;
        if ('setAppBadge' in navigator) {
          try {
            if (pendingCount > 0) {
              (navigator as any).setAppBadge(pendingCount);
            } else {
              (navigator as any).clearAppBadge();
            }
          } catch (e) {
            console.log("Badge API error", e);
          }
        }
      }
    }
  }, [loggedIn, mode, allParcels, name, staffList, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowInstallPrompt(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const activeTeacher = useMemo(() => staffList.find(t => t.id === selectedTeacherId), [staffList, selectedTeacherId]);
  const [adminFilter, setAdminFilter] = useState<'TOTAL' | 'PROCESSING' | 'WAITING' | 'COMPLETED' | null>(null);
  const [adminMainView, setAdminMainView] = useState<'DASHBOARD' | 'BOARD'>('DASHBOARD');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatedThankYou, setGeneratedThankYou] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'default' | 'success' } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeTab, selectedTeacherId, activeChannelId]);

  const currentUser = useMemo(() => {
    if (!loggedIn) return null;
    if (mode === "ADMIN") return { id: "admin", name: name || "관리자", role: role || "행정실" };
    if (mode === "STUDENT") return { id: "student-" + name, name: name, role: "배송기사" };
    const found = staffList.find(s => s.name === name);
    return found ? { ...found } : { id: "unknown", name, role: "미정" };
  }, [loggedIn, mode, name, staffList]);

  const chatTargetId = mode === "ADMIN" ? selectedTeacherId : (activeTab === 'CHAT' ? PUBLIC_CHAT_ID : currentUser?.id);
  const currentMessages = useMemo(() => {
    if (mode === 'ADMIN') {
      if (!selectedTeacherId) return [];
      if (selectedTeacherId === PUBLIC_CHAT_ID) return messages.filter(m => m.targetId === PUBLIC_CHAT_ID);
      return messages.filter(m => m.targetId === selectedTeacherId);
    }
    if (activeTab === 'CHAT') {
      if (!activeChannelId) return [];
      if (activeChannelId === PUBLIC_CHAT_ID) { return messages.filter(m => m.targetId === PUBLIC_CHAT_ID); }
      // [추가된 로직] 선물함 채널일 경우, 내게 온 선물 메시지만 필터링
      if (activeChannelId === "gift_box") {
        return messages.filter(m => m.kind === 'GIFT' && m.targetId === currentUser?.id);
      }
      return messages.filter(m => m.channelId === activeChannelId || m.parcelId === activeChannelId);
    }
    return [];
  }, [messages, chatTargetId, mode, name, activeTab, activeChannelId, selectedTeacherId, currentUser]);

  const myParcels = useMemo(() => {
    if (!currentUser?.id) return [];
    if (mode === 'TEACHER') { return allParcels.filter(p => p.receiverId === currentUser.id); } else { return allParcels.filter(p => p.courierName === name); }
  }, [allParcels, currentUser, mode, name]);

  const chatChannels = useMemo(() => {
    const channels = [];
    channels.push({ id: PUBLIC_CHAT_ID, name: "📢 전체 공용 대화방", subtitle: "학교 구성원 전체", type: "PUBLIC" });

    // [추가된 채널] 학생일 경우 '🎁 받은 선물함' 채널 추가
    if (mode === 'STUDENT') {
      const hasGifts = messages.some(m => m.kind === 'GIFT' && m.targetId === currentUser?.id);
      channels.push({
        id: "gift_box",
        name: "🎁 받은 선물함",
        subtitle: hasGifts ? "선생님이 보낸 선물을 확인하세요!" : "도착한 선물이 없습니다.",
        type: "SYSTEM",
        date: "" // System channel needs consistent type
      });
    }

    const validParcels = myParcels.filter(p => p.status !== 'PENDING' && p.courierName);
    validParcels.forEach(p => {
      const opponentName = mode === 'TEACHER' ? `${p.courierName} 기사` : `${p.receiver} 선생님`;

      // Calculate Date
      const dateObj = new Date(getSeconds(p.createdAt) * 1000);
      const dateStr = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`;

      channels.push({
        id: p.id || "unknown",
        name: opponentName,
        subtitle: `${p.itemName} (${p.status === 'COMPLETED' ? '배송완료' : '배송중'})`,
        type: "PRIVATE",
        parcel: p,
        date: dateStr
      });
    });
    return channels;
  }, [myParcels, mode, messages, currentUser, couriers, staffList]);

  const unreadNoticeCount = useMemo(() => {
    if (mode !== 'TEACHER' || !currentUser?.id) return 0;
    return messages.filter(m => m.targetId === currentUser.id && m.kind === 'NOTICE').length;
  }, [messages, mode, currentUser]);


  const hasUnreadFromTeacher = (teacherId: string) => { const teacherMessages = messages.filter(m => m.targetId === teacherId); if (teacherMessages.length === 0) return false; const lastMsg = teacherMessages[teacherMessages.length - 1]; return lastMsg.senderType === 'TEACHER'; };

  const handleLogout = async () => { if (mode === 'TEACHER' && currentUser?.id && currentUser.id !== 'unknown') { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', currentUser.id)); } catch (e) { } } clearLogin(); window.location.reload(); };

  const handleRegisterParcel = async (teacherId: string, teacherName: string, location: string, item: string, qty: string, isUrgent: boolean, sender: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      // Create Parcel
      const newParcelRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'parcels'), {
        itemName: `${item} ${qty}`,
        sender: sender,
        receiver: teacherName,
        receiverId: teacherId,
        arrivedAt: new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" }),
        status: "PENDING",
        location,
        createdAt: serverTimestamp(),
        isUrgent // Ensure isUrgent is saved
      });

      // Send Notice Message
      const noticeText = `\n${teacherName} 선생님,\n${location}에 [${item} ${qty}]이(가) 도착했습니다!\n\n아래 버튼을 눌러주시면 학생 배송기사가\n선생님 계신 곳으로 안전하게 배송해 드립니다.`;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
        targetId: teacherId,
        senderType: "SYSTEM",
        text: noticeText,
        kind: "NOTICE",
        parcelId: newParcelRef.id,
        createdAt: serverTimestamp()
      });

      setShowRegisterModal(false);
      setNotification({ msg: `${teacherName} 선생님께 알림 전송 완료! 📨`, type: 'success' });
    } catch (e: any) {
      console.error("Parcel Register Error:", e);
      alert(`등록 실패: ${e.message}`);
    }
  };

  const handleRequestDelivery = async (parcelId: string, isUrgent = false) => { if (!user) return; try { const parcelRef = doc(db, 'artifacts', appId, 'public', 'data', 'parcels', parcelId); await updateDoc(parcelRef, { status: "WAITING", isUrgent }); setNotification({ msg: "🚀 배송이 신청되었습니다! 기사님을 기다려주세요.", type: 'success' }); } catch (e) { console.error(e); alert("신청 중 오류가 발생했습니다."); } };
  const handleAcceptDelivery = async (parcelId: string) => { if (!user || mode !== 'STUDENT') return; const myProfile = couriers.find(c => c.name === name); try { const parcelRef = doc(db, 'artifacts', appId, 'public', 'data', 'parcels', parcelId); await updateDoc(parcelRef, { status: "DELIVERING", courierName: name, courierId: myProfile?.id }); const targetParcel = allParcels.find(p => p.id === parcelId); if (targetParcel) { await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), { targetId: targetParcel.receiverId, channelId: parcelId, senderType: "SYSTEM", text: "기사가 배정되었습니다.", kind: "ASSIGNMENT", courierName: name, courierPhoto: myProfile?.photoUrl || "", createdAt: serverTimestamp() }); } setNotification({ msg: "배송을 시작합니다! 채팅방이 생성되었습니다.", type: 'success' }); setActiveTab('CHAT'); setActiveChannelId(parcelId); } catch (e) { console.error(e); alert("수락 실패"); } };

  const handleCompleteDelivery = async (type: "SIGNATURE" | "PHOTO", image: string) => {
    console.log("handleCompleteDelivery started", { type, imageLength: image?.length, targetParcelId });
    if (!user || !targetParcelId) {
      console.warn("Missing user or targetParcelId", { user: !!user, targetParcelId });
      return;
    }
    const myProfile = couriers.find(c => c.name === name);
    try {
      console.log("Updating parcel status...");
      const parcelRef = doc(db, 'artifacts', appId, 'public', 'data', 'parcels', targetParcelId);
      await updateDoc(parcelRef, { status: "COMPLETED", proofType: type, proofImage: image });
      console.log("Parcel status updated.");

      // Update Courier Points
      if (myProfile) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', myProfile.id), { points: (myProfile.points || 0) + 10 }); }

      const targetParcel = allParcels.find(p => p.id === targetParcelId);
      console.log("Target parcel found:", targetParcel);

      // [UPDATE] Update Teacher Points (Reward for Receiver)
      if (targetParcel && targetParcel.receiverId) {
        const teacher = staffList.find(s => s.id === targetParcel.receiverId);
        if (teacher) {
          const currentPoints = teacher.points || 0;
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', targetParcel.receiverId), {
            points: currentPoints + 50 // Reward 50 points to teacher
          }, { merge: true });
        }
      }

      if (targetParcel) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), { targetId: targetParcel.receiverId, channelId: targetParcel.id, senderType: "SYSTEM", text: "배송이 완료되었습니다!", kind: "COMPLETION_REVIEW", parcelId: targetParcel.id, courierName: name, createdAt: serverTimestamp() });
        // Set Journal Target explicitly to the current parcel before clearing targetParcelId
        setJournalTargetParcel(targetParcel);

        // [GAMIFICATION] Confetti Effect
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        });

        // [MODIFIED] Open Receipt Modal FIRST
        console.log("Setting receipt data and opening modal...");
        setReceiptData({
          parcel: targetParcel,
          proofUrl: image || "",
          courier: myProfile // Include courier info for receipt
        });
        setShowReceiptModal(true);
      } else {
        console.error("Target parcel not found in allParcels!");
      }

      // Close Proof Modal
      setShowProofModal(false);
      setTargetParcelId(null);

      // Journal Modal will be opened AFTER Receipt Modal is closed/next
      // setShowJournalModal(true); // Moved to Receipt onClose

    } catch (e: any) {
      console.error("Parcel Register Error:", e);
      alert(`등록 실패: ${e.message}`);
    }
  };

  const handleSubmitFeedback = async (parcelId: string, rating: number, feedback: string) => { if (!user) return; try { const parcelRef = doc(db, 'artifacts', appId, 'public', 'data', 'parcels', parcelId); await updateDoc(parcelRef, { rating, feedback }); const targetParcel = allParcels.find(p => p.id === parcelId); if (targetParcel && targetParcel.courierName) { await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), { targetId: `student-${targetParcel.courierName}`, channelId: parcelId, senderType: "TEACHER", senderName: user.displayName || "선생님", text: feedback, kind: "FEEDBACK", rating: rating, courierName: targetParcel.courierName, parcelId: parcelId, createdAt: serverTimestamp() }); setNotification({ msg: "피드백을 전송했습니다! 💌", type: 'success' }); } } catch (e) { console.error(e); } };
  const handleSaveJournal = async (text: string) => { if (!user || !journalTargetParcel?.id) return; try { const parcelRef = doc(db, 'artifacts', appId, 'public', 'data', 'parcels', journalTargetParcel.id); await updateDoc(parcelRef, { journal: text }); if (journalTargetParcel) { await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), { targetId: journalTargetParcel.receiverId, channelId: journalTargetParcel.id, senderType: "STUDENT", text: text, kind: "JOURNAL", parcelId: journalTargetParcel.id, courierName: name, createdAt: serverTimestamp() }); } setShowJournalModal(false); setJournalTargetParcel(null); setNotification({ msg: "일기가 저장되고 선생님께 초대장이 전송되었습니다! 💌", type: 'success' }); } catch (e) { console.error(e); alert("저장 실패"); } };
  const handleAddCourier = async (name: string, photoUrl: string, slots: string[], desc: string) => {
    if (!user) {
      alert("관리자 권한이 필요합니다. (로그인 확인)");
      return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'couriers'), {
        name,
        photoUrl,
        availableSlots: slots,
        description: desc,
        points: 0,
        createdAt: serverTimestamp(),
        inventory: []
      });
      setShowCourierModal(false);
      setNotification({ msg: "기사 등록 완료! 🎉", type: 'success' });
    } catch (e: any) {
      console.error("Courier Add Error:", e);
      alert(`등록 실패: ${e.message}`);
    }
  };
  const handleEditCourier = async (id: string, name: string, photoUrl: string, slots: string[], desc: string) => { if (!user) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', id), { name, photoUrl, availableSlots: slots, description: desc }); setShowCourierModal(false); setCourierToEdit(null); setNotification({ msg: "수정 완료", type: 'success' }); } catch (e: any) { console.error(e); alert(`수정 실패: ${e.message}`); } };
  const handleDeleteCourier = async (id: string) => { if (!user) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', id)); setNotification({ msg: "삭제 완료", type: 'success' }); setShowDeleteConfirmModal(false); } catch (e) { alert("삭제 실패"); } };
  const handleSendMessage = async (text: string) => { if (!text.trim() || !user) return; let finalTargetId = PUBLIC_CHAT_ID; let finalChannelId = activeChannelId || PUBLIC_CHAT_ID; if (activeChannelId !== PUBLIC_CHAT_ID) { finalTargetId = "private_group"; finalChannelId = activeChannelId!; } else { finalTargetId = PUBLIC_CHAT_ID; } try { await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), { targetId: finalTargetId, channelId: finalChannelId, senderType: mode, senderName: name, text, createdAt: serverTimestamp() }); setInput(""); } catch (e) { alert("전송 실패"); } };
  const requestDeleteCourier = (id: string) => { setDeleteTargetId(id); setShowDeleteConfirmModal(true); };
  const performDeleteCourier = () => deleteTargetId && handleDeleteCourier(deleteTargetId);

  // Custom Staff Logic
  const handleAddStaff = async (name: string, role: string, location: string, photoUrl: string, description: string) => {
    if (!user || mode !== 'ADMIN') return;
    try {
      const newId = `cstaff_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom_staff', newId), {
        name, role, location, photoUrl, description
      });
      setShowStaffEditModal(false);
      setNotification({ msg: "선생님 명단이 추가되었습니다.", type: "success" });
    } catch (e) { console.error(e); alert("추가 실패"); }
  };

  const handleEditStaff = async (id: string, name: string, role: string, location: string, photoUrl: string, description: string) => {
    if (!user || mode !== 'ADMIN') return;
    try {
      // Both initial staff and custom staff are edited in custom_staff
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom_staff', id), {
        name, role, location, photoUrl, description
      }, { merge: true });

      // Also update active_users if they are logged in recently
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', id), {
        name, role, location, photoUrl, description
      }, { merge: true });

      setShowStaffEditModal(false);
      setStaffToEdit(null);
      setNotification({ msg: "선생님 프로필 수정 완료", type: "success" });
    } catch (e) { console.error(e); alert("수정 실패"); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!user || mode !== 'ADMIN') return;
    try {
      // Add a tombstone in custom_staff so initialStaff doesn't show them if they were default
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom_staff', id), { deleted: true });
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', id));
      setShowDeleteStaffConfirmModal(false);
      setNotification({ msg: "선생님이 삭제되었습니다.", type: "success" });
    } catch (e) { alert("삭제 실패"); }
  };
  const requestDeleteStaff = (id: string) => { setDeleteStaffTargetId(id); setShowDeleteStaffConfirmModal(true); };
  const performDeleteStaff = () => deleteStaffTargetId && handleDeleteStaff(deleteStaffTargetId);

  const handleAiThankYou = async (item: string, sender: string) => { setAiModalOpen(true); setGeneratedThankYou(""); setAiGenerating(true); try { const res = await callGemini(`학교 선생님이 택배를 받고 보내는 감사 메시지. 물품: ${item}, 발신: ${sender}. 정중하고 예의 바르게. 50자 이내.`); setGeneratedThankYou(res); } catch (e) { setGeneratedThankYou("감사합니다! 잘 받았습니다."); } setAiGenerating(false); };
  const toggleLocation = (location: string) => setOpenLocations(prev => ({ ...prev, [location]: !prev[location] }));

  const handleUpdateShopItems = async (newItems: any[]) => { if (!user) return; setShopItems(newItems); try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shop', 'list'), { items: newItems }); setNotification({ msg: "상점 물품 목록이 업데이트되었습니다.", type: 'success' }); } catch (e) { console.error(e); setNotification({ msg: "저장에 실패했습니다.", type: 'default' }); } };

  const handlePurchase = async (item: any) => {
    if (!user) return;
    const myProfile = couriers.find(c => c.name === name);
    if (!myProfile) return;
    if ((myProfile.points || 0) < item.price) { alert("포인트가 부족합니다!"); return; }
    try {
      const newItem: InventoryItem = { id: Math.random().toString(36).substr(2, 9), itemId: item.id, name: item.name, icon: item.icon, price: item.price, purchasedAt: new Date(), isUsed: false };
      const newInventory = [...(myProfile.inventory || []), newItem];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', myProfile.id), { points: (myProfile.points || 0) - item.price, inventory: newInventory });
      setNotification({ msg: `${item.name} 구매 완료! (-${item.price}P) 배낭에 담겼습니다.`, type: 'success' });
    } catch (e) { console.error(e); alert("구매 실패"); }
  };

  const handleUseItem = async (itemId: string) => { if (!user) return; const myProfile = couriers.find(c => c.name === name); if (!myProfile || !myProfile.inventory) return; try { const updatedInventory = myProfile.inventory.map(item => item.id === itemId ? { ...item, isUsed: true } : item); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', myProfile.id), { inventory: updatedInventory }); setNotification({ msg: "아이템 사용 완료! 👍", type: 'success' }); } catch (e) { console.error(e); alert("아이템 사용 실패"); } };

  const handleAdminGivePoints = async (courierId: string, amount: number, reason: string) => { if (!user || mode !== 'ADMIN') return; try { const targetCourier = couriers.find(c => c.id === courierId); if (!targetCourier) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', courierId), { points: (targetCourier.points || 0) + amount }); setNotification({ msg: `${targetCourier.name} 학생에게 ${amount}P 지급 완료!`, type: 'success' }); setSelectedCourierProfile(null); } catch (e) { console.error(e); alert("지급 실패"); } };

  // [함수 추가] 관리자가 선생님에게 포인트 지급
  const handleAdminGiveTeacherPoints = async (staffId: string, amount: number, reason: string) => {
    if (!user || mode !== 'ADMIN') return;
    try {
      const targetStaff = staffList.find(s => s.id === staffId);
      if (!targetStaff) return;

      const currentPoints = targetStaff.points || 0;
      // active_users 컬렉션에 포인트 업데이트 (문서가 없으면 생성됨)
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', staffId), {
        points: currentPoints + amount,
        name: targetStaff.name, // 문서 생성 시 필요할 수 있음
        role: targetStaff.role
      }, { merge: true });

      setNotification({ msg: `${targetStaff.name} 선생님께 ${amount}P 충전 완료!`, type: 'success' });
      // setShowStaffProfileModal(false); // 연속 충전을 위해 닫지 않음
    } catch (e) {
      console.error(e);
      alert("지급 실패");
    }
  };

  const handleStartCompletion = (parcel: Parcel) => { setChecklistParcel(parcel); setShowChecklistModal(true); };
  const handleChecklistConfirmed = () => { if (checklistParcel) { setTargetParcelId(checklistParcel.id || null); setShowChecklistModal(false); setShowProofModal(true); } };
  const handleLocalDescriptionChange = (val: string) => { setEditProfile(prev => ({ ...prev, desc: val })); setHasChanges(true); };
  const toggleLocalSlot = (slot: string) => { setEditProfile(prev => { const newSlots = prev.slots.includes(slot) ? prev.slots.filter(s => s !== slot) : [...prev.slots, slot]; return { ...prev, slots: newSlots }; }); setHasChanges(true); };
  const handleLocalPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { try { setNotification({ msg: "사진을 처리중입니다...", type: 'default' }); const compressed = await compressImage(e.target.files[0]); setEditProfile(prev => ({ ...prev, photo: compressed })); setHasChanges(true); setNotification({ msg: "사진이 선택되었습니다. 저장 버튼을 눌러주세요.", type: 'success' }); } catch (error) { console.error(error); alert("사진 처리 실패"); } } };
  const handleSaveProfile = async () => { if (!user) return; if (mode === 'STUDENT') { const myProfile = couriers.find(c => c.name === name); if (!myProfile) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', myProfile.id), { description: editProfile.desc, availableSlots: editProfile.slots, photoUrl: editProfile.photo }); setNotification({ msg: "프로필이 성공적으로 저장되었습니다! ✨", type: 'success' }); setHasChanges(false); } catch (e) { console.error(e); alert("저장 실패"); } } else if (mode === 'TEACHER') { const me = staffList.find(s => s.name === name); if (!me) return; try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', me.id), { name: me.name, photoUrl: editProfile.photo, description: editProfile.desc, lastActive: serverTimestamp() }, { merge: true }); setNotification({ msg: "선생님 프로필이 저장되었습니다! 👩‍🏫", type: 'success' }); setHasChanges(false); } catch (e) { console.error(e); alert("저장 실패"); } } };
  const calculateCourierStats = (courierName: string) => { const deliveredCount = allParcels.filter(p => p.courierName === courierName && p.status === 'COMPLETED').length; let level = LEVEL_THRESHOLDS[0]; for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) { if (deliveredCount >= LEVEL_THRESHOLDS[i].min) { level = LEVEL_THRESHOLDS[i]; break; } } const nextLevelIndex = LEVEL_THRESHOLDS.indexOf(level) + 1; const nextLevel = nextLevelIndex < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextLevelIndex] : null; const progress = nextLevel ? ((deliveredCount - level.min) / (nextLevel.min - level.min)) * 100 : 100; const badges = []; if (deliveredCount >= 10) badges.push({ name: "성실왕", icon: Zap, color: "text-amber-500", bg: "bg-amber-100" }); const ratedParcels = allParcels.filter(p => p.courierName === courierName && p.rating); const avgRating = ratedParcels.length > 0 ? ratedParcels.reduce((acc, p) => acc + (p.rating || 0), 0) / ratedParcels.length : 0; if (avgRating >= 4.5 && ratedParcels.length >= 3) badges.push({ name: "친절왕", icon: Award, color: "text-rose-500", bg: "bg-rose-100" }); return { level, deliveredCount, nextLevel, progress, badges, avgRating }; };
  const handleCreatePost = async (courierName: string, content: string) => { if (!user) return; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), { authorName: name, authorRole: mode, targetCourierName: courierName, content: content, likes: [], createdAt: serverTimestamp() }); setShowWritePostModal(false); setNotification({ msg: "칭찬 글이 등록되었습니다! 🎉", type: "success" }); } catch (e) { console.error(e); alert("등록 실패"); } };
  const handleLikePost = async (postId: string, currentLikes: string[]) => { if (!user || !currentUser?.id) return; const userId = currentUser.id; const newLikes = currentLikes.includes(userId) ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId]; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId), { likes: newLikes }); } catch (e) { console.error(e); } };
  const handleAddComment = async (postId: string) => { if (!user || !newCommentText.trim()) return; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comments'), { postId, authorName: name, authorRole: mode, content: newCommentText, createdAt: serverTimestamp() }); setNewCommentText(""); } catch (e) { console.error(e); } };
  const handleDeletePost = async (postId: string) => { if (!user || mode !== 'ADMIN') return; if (!window.confirm('이 칭찬 글을 삭제하시겠습니까?')) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId)); setNotification({ msg: '게시글이 삭제되었습니다.', type: 'success' }); } catch (e) { console.error(e); alert('삭제 실패'); } };
  const handleDeleteComment = async (commentId: string) => { if (!user || mode !== 'ADMIN') return; if (!window.confirm('이 댓글을 삭제하시겠습니까?')) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', commentId)); setNotification({ msg: '댓글이 삭제되었습니다.', type: 'success' }); } catch (e) { console.error(e); alert('댓글 삭제 실패'); } };

  // ---- Teacher Gift Logic ----
  const handleStartGift = (item: any) => {
    setGiftTargetItem(item);
    setShowShopModal(false);
    setShowShopModal(false);
    setShowGiftStudentModal(true);
  };

  const handleUpdateAppIcon = async (iconUrl: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_settings', 'config'), {
        iconUrl
      }, { merge: true });
      setNotification({ msg: "앱 아이콘이 변경되었습니다!", type: 'success' });
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }
  };

  const handleConfirmGift = async (courier: Courier) => {
    if (!user || !giftTargetItem || !currentUser?.id) return;
    const currentPoints = currentUser.points || 0;

    if (currentPoints < giftTargetItem.price) {
      alert("보유 포인트가 부족합니다.");
      return;
    }

    try {
      // 1. Deduct Teacher Points
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', currentUser.id), {
        points: currentPoints - giftTargetItem.price
      }, { merge: true });

      // 2. Add to Student Inventory
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        itemId: giftTargetItem.id,
        name: giftTargetItem.name,
        icon: giftTargetItem.icon,
        price: giftTargetItem.price,
        purchasedAt: new Date(),
        isUsed: false,
        giftedBy: name // Record sender
      };
      const newInventory = [...(courier.inventory || []), newItem];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'couriers', courier.id), {
        inventory: newInventory
      });

      // 3. Send Notification Message
      await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'messages')), {
        targetId: `student-${courier.name}`,
        senderType: "SYSTEM",
        kind: "GIFT",
        text: `${name} 선생님이 선물을 보냈습니다.`,
        itemName: giftTargetItem.name,
        senderName: name,
        createdAt: serverTimestamp(),
        channelId: "gift_box" // 채널 ID 명시
      });

      setNotification({ msg: `${courier.name} 학생에게 선물을 보냈습니다! 🎁`, type: 'success' });
      setShowGiftStudentModal(false);
      setGiftTargetItem(null);

    } catch (e) {
      console.error(e);
      alert("선물하기 실패");
    }
  };

  const handleTrackingClick = (status: 'WAITING' | 'DELIVERING') => {
    const filtered = myParcels.filter(p => p.status === status);
    if (filtered.length === 0) return;

    if (status === 'WAITING') {
      const msg = filtered.map(p => `📦 [${p.itemName}]\n보낸사람: ${p.sender}`).join('\n\n');
      alert(`[접수 완료 - 배정 대기중]\n\n${msg}`);
    } else {
      const msg = filtered.map(p => `📦 [${p.itemName}]\n담당 기사님: ${p.courierName} 학생`).join('\n\n');
      alert(`[배송 진행 중]\n\n${msg}`);
    }
  };

  // --- Render ---
  // Memoize onFinish to prevent LaunchAnimation from resetting its timer on every render
  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) return <LaunchAnimation onFinish={handleSplashFinish} iconUrl={appSettings.iconUrl} />;

  if (!loggedIn) {
    const filteredLoginStaff = staffList.filter(s => (s.name || '').includes(loginSearch) || (s.role || '').includes(loginSearch));
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden">
        <SpaceBackground />
        {showAdminLogin && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"> <div className="w-full max-w-xs bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"> <h3 className="font-bold text-center mb-4">관리자 접속</h3> <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 mb-4 text-sm bg-white/50 focus:bg-white transition-colors" placeholder="비밀번호 입력" /> <div className="flex gap-2"><button onClick={() => setShowAdminLogin(false)} className="flex-1 py-2 bg-slate-100/50 hover:bg-slate-200 rounded-xl text-xs transition-colors">취소</button><button onClick={() => { if (password === '8369') { saveLogin("관리자", "행정실", "ADMIN"); setMode("ADMIN"); setLoggedIn(true); } else { alert("비밀번호 불일치"); } }} className="flex-1 py-2 bg-[#fee500] hover:bg-yellow-400 rounded-xl text-xs font-bold transition-colors shadow-lg">접속</button></div> </div> </div>)}
        <div className={`w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative z-10 border border-white/20 transition-all duration-700 ${showSplash ? 'animate-launch' : ''}`}>
          <div className="mb-8 text-center">
            <div className="text-6xl mb-2 filter drop-shadow-lg flex justify-center animate-float">
              {appSettings.iconUrl ? (
                <img src={appSettings.iconUrl} className="w-24 h-24 object-contain" alt="Logo" />
              ) : (
                "🚀"
              )}
            </div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-tight mb-2">Rocket Talk</h1>
            <p className="text-sm font-medium text-indigo-200/80">우리 학교 배송 메신저</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setMode("TEACHER")} className={`group pt-2 pb-4 px-2 rounded-2xl border-2 flex flex-col items-center gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 ${mode === 'TEACHER' ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-white/10 bg-white/5 text-slate-300 hover:border-indigo-400/50 hover:bg-white/10'}`} >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-400/40 transition-colors duration-300"></div>
                <img src="https://i.postimg.cc/Wbmj8jrx/Gemini-Generated-Image-ey15iuey15iuey15-removebg-preview.png" alt="Teacher" className="w-32 h-32 object-contain drop-shadow-xl -mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-sm font-bold relative z-10 tracking-wide">선생님</span>
            </button>
            <button onClick={() => setMode("STUDENT")} className={`group pt-2 pb-4 px-2 rounded-2xl border-2 flex flex-col items-center gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 ${mode === 'STUDENT' ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/50 hover:bg-white/10'}`} >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-400/40 transition-colors duration-300"></div>
                <img src="https://i.postimg.cc/FHZrrmHj/Gemini-Generated-Image-22nn8m22nn8m22nn-removebg-preview.png" alt="Courier" className="w-32 h-32 object-contain drop-shadow-xl -mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-sm font-bold relative z-10 tracking-wide">배송기사</span>
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {mode === "TEACHER" ? (
              <div className="relative group">
                <input type="text" value={loginSearch} onChange={(e) => { setLoginSearch(e.target.value); setShowLoginSuggestions(true); if (e.target.value === "") { setName(""); setRole(""); } }} onFocus={() => setShowLoginSuggestions(true)} className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-300 text-sm focus:border-indigo-400 focus:bg-white/20 outline-none shadow-inner backdrop-blur-md transition-all" placeholder="선생님 성함을 입력하세요" />
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-300 transition-colors" size={20} />
                {showLoginSuggestions && (loginSearch || filteredLoginStaff.length > 0) && (<div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 scrollbar-hide"> {filteredLoginStaff.map(s => (<button key={s.id} className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 border-b border-white/5 last:border-none flex justify-between items-center transition-colors text-slate-200" onClick={() => { setName(s.name); setRole(s.role); setLoginSearch(s.name); setShowLoginSuggestions(false); }}> <span className="font-bold text-white">{s.name}</span><span className="text-xs text-slate-400">{s.role}</span> </button>))} </div>)}
              </div>
            ) : (
              <div className="relative group">
                <select value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-300 text-sm focus:border-emerald-400 focus:bg-white/20 outline-none appearance-none shadow-inner backdrop-blur-md transition-all">
                  <option value="" className="bg-slate-800">기사님을 선택하세요</option>
                  {couriers.map(c => <option key={c.id} value={c.name} className="bg-slate-800">{c.name}</option>)}
                </select>
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-300 transition-colors" size={20} />
                <div className="absolute right-4 top-4 pointer-events-none text-slate-300"><ChevronDown size={20} /></div>
              </div>
            )}
          </div>

          <button onClick={async () => { if (mode === "TEACHER" && !name) return alert("이름을 선택해주세요."); if (mode === "STUDENT") { if (!studentName) return alert("기사님 이름을 선택해주세요."); const matchedCourier = couriers.find(c => c.name === studentName); if (!matchedCourier) return alert("등록된 기사님 정보가 일치하지 않습니다."); } const finalName = mode === "TEACHER" ? name : studentName; const finalRole = mode === "TEACHER" ? role : "배송기사"; saveLogin(finalName, finalRole, mode); if (mode === "TEACHER") { const staff = staffList.find(s => s.name === finalName); if (staff) try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'active_users', staff.id), { name: staff.name, lastActive: serverTimestamp() }, { merge: true }); } catch (e) { } } setName(finalName); setShowSplash(true); requestNotificationPermission(); setTimeout(() => setLoggedIn(true), 600); }} className={`relative overflow-hidden w-full text-white py-4 rounded-xl font-bold shadow-2xl transform transition-all active:scale-95 border-b-4 ${mode === 'TEACHER' ? 'bg-indigo-600 border-indigo-800 hover:bg-indigo-500 shadow-indigo-500/50' : 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500 shadow-emerald-500/50'}`} >
            <span className="relative z-10 flex items-center justify-center gap-2">🚀 발사 준비 완료 (입장)</span>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>

          <div className="mt-8 text-center">
            <button onClick={() => { setPassword(""); setShowAdminLogin(true); }} className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"><Settings size={12} /> 관리자 모드</button>
          </div>
        </div>
      </div>
    );
  }

  const notificationComponent = notification && <NotificationToast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />;

  if (mode === "ADMIN") {
    const adminDateString = currentTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
    const filteredParcels = allParcels.filter(p => adminFilter === 'TOTAL' ? true : adminFilter === 'PROCESSING' ? p.status === 'DELIVERING' : adminFilter === 'WAITING' ? p.status === 'PENDING' : adminFilter === 'COMPLETED' ? p.status === 'COMPLETED' : true);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#b2c7d9] p-4">
        {notificationComponent}
        <ParcelStatusModal
          isOpen={!!adminFilter}
          onClose={() => setAdminFilter(null)}
          filterType={adminFilter}
          parcels={allParcels}
          staffList={staffList}
          onDelete={(parcelId: string) => {
            setDeleteParcelId(parcelId);
            setShowDeleteParcelConfirm(true);
          }}
        />
        <ConfirmModal
          isOpen={showDeleteParcelConfirm}
          onClose={() => setShowDeleteParcelConfirm(false)}
          message="정말 이 택배 데이터를 삭제하시겠습니까?"
          subMessage="삭제된 데이터는 복구할 수 없습니다."
          onConfirm={async () => {
            if (deleteParcelId) {
              try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'parcels', deleteParcelId));
                setNotification({ msg: "택배 데이터가 영구 삭제되었습니다.", type: 'success' });
              } catch (e) {
                console.error("Delete failed", e);
                alert("삭제 중 오류가 발생했습니다.");
              }
            }
            setShowDeleteParcelConfirm(false);
            setDeleteParcelId(null);
          }}
        />  <CourierProfileModal isOpen={!!selectedCourierProfile} onClose={() => setSelectedCourierProfile(null)} courier={selectedCourierProfile} stats={selectedCourierProfile ? calculateCourierStats(selectedCourierProfile.name) : null} onGivePoints={handleAdminGivePoints} />

        {/* [모달 렌더링 추가] 선생님 프로필 및 포인트 관리 */}
        {activeTeacher && (
          <StaffProfileModal
            isOpen={showStaffProfileModal}
            onClose={() => setShowStaffProfileModal(false)}
            staff={activeTeacher}
            onGivePoints={handleAdminGiveTeacherPoints}
          />
        )}

        <ManageShopModal isOpen={showShopManageModal} onClose={() => setShowShopManageModal(false)} items={shopItems} onSave={handleUpdateShopItems} />
        <AppIconSettingsModal isOpen={showIconSettingsModal} onClose={() => setShowIconSettingsModal(false)} currentIcon={appSettings.iconUrl} onSave={handleUpdateAppIcon} />
        <ConfirmModal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} onConfirm={performDeleteCourier} message="기사님을 삭제하시겠습니까?" />
        <ConfirmModal isOpen={showDeleteStaffConfirmModal} onClose={() => setShowDeleteStaffConfirmModal(false)} onConfirm={performDeleteStaff} message="이 선생님 명단을 정말 삭제하시겠습니까?" />
        {showCourierModal && <AddCourierModal onClose={() => { setShowCourierModal(false); setCourierToEdit(null); }} onAdd={handleAddCourier} onEdit={handleEditCourier} initialData={courierToEdit} />}
        {showStaffEditModal && <AddStaffModal onClose={() => { setShowStaffEditModal(false); setStaffToEdit(null); }} onAdd={handleAddStaff} onEdit={handleEditStaff} initialData={staffToEdit} />}
        {showRegisterModal && <RegisterParcelModal onClose={() => setShowRegisterModal(false)} onRegister={handleRegisterParcel} staffList={staffList} />}
        {showWritePostModal && <WritePostModal onClose={() => setShowWritePostModal(false)} onPost={handleCreatePost} couriers={couriers} authorName={name} />}

        <div className="flex h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-black/5 bg-[#b2c7d9] shadow-2xl">
          <aside className="flex w-72 flex-col border-r border-black/5 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100"><div><span className="text-xs text-slate-400">관리자 모드</span><div className="font-bold text-slate-800">관리자</div></div><button onClick={handleLogout} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><LogOut size={12} /></button></div>
            <div className="p-3 border-b border-slate-100 bg-white"><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={14} /><input value={staffSearchQuery} onChange={e => setStaffSearchQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm outline-none" placeholder="이름 검색" /></div></div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border-b border-slate-100">
              <button onClick={() => { setAdminMainView('DASHBOARD'); setSelectedTeacherId(null); }} className={`flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-xl shadow-sm transition-colors ${adminMainView === 'DASHBOARD' && !selectedTeacherId ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><Layout size={14} /> 대시보드</button>
              <button onClick={() => { setAdminMainView('BOARD'); setSelectedTeacherId(null); }} className={`flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-xl shadow-sm transition-colors ${adminMainView === 'BOARD' && !selectedTeacherId ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}><MessageSquare size={14} /> 게시판 관리</button>
              <button onClick={() => { setStaffToEdit(null); setShowStaffEditModal(true); }} className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 py-2 rounded-xl shadow-sm hover:bg-slate-50"><User size={14} /> 교사 관리</button>
              <button onClick={() => { setCourierToEdit(null); setShowCourierModal(true); }} className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 py-2 rounded-xl shadow-sm hover:bg-slate-50"><Truck size={14} /> 기사 관리</button>
              <button onClick={() => setShowShopManageModal(true)} className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 py-2 rounded-xl shadow-sm hover:bg-indigo-50"><ShoppingBag size={14} /> 상점 관리</button>
              <button onClick={() => setShowIconSettingsModal(true)} className="flex items-center justify-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 py-2 rounded-xl shadow-sm hover:bg-slate-50"><ImageIcon size={14} /> 앱 아이콘 설정</button>
            </div>
            <div className="flex-1 overflow-y-auto"><button onClick={() => { setSelectedTeacherId(PUBLIC_CHAT_ID); setAdminFilter(null); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-slate-50 ${selectedTeacherId === PUBLIC_CHAT_ID ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'}`}><div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold"><Users size={16} /></div><div className="font-bold text-slate-700 text-sm">📢 전체 대화방</div></button>{STAFF_LOCATIONS.map(loc => { const sectionStaff = filteredAndGroupedStaff[loc] || []; const visibleStaff = sectionStaff.filter(s => !(s as any).deleted); if (visibleStaff.length === 0) return null; return (<div key={loc} className="border-b border-slate-50"><button onClick={() => toggleLocation(loc)} className="w-full text-left bg-slate-50/50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">{loc} ({visibleStaff.length})</button>{(openLocations[loc] ?? true) && (<div>{visibleStaff.map(t => (<button key={t.id} onClick={(e) => { setSelectedTeacherId(t.id); setAdminFilter(null); }} className={`relative group w-full text-left px-4 py-3 flex items-center gap-3 ${selectedTeacherId === t.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'}`}><div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><span onClick={(e) => { e.stopPropagation(); setStaffToEdit(t); setShowStaffEditModal(true); }} className="bg-white p-1.5 rounded-full text-slate-500 hover:text-blue-600 shadow-sm"><Pencil size={12} /></span><span onClick={(e) => { e.stopPropagation(); requestDeleteStaff(t.id); }} className="bg-white p-1.5 rounded-full text-slate-500 hover:text-red-600 shadow-sm"><Trash2 size={12} /></span></div><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'} overflow-hidden`}>{t.photoUrl ? <img src={t.photoUrl} className="w-full h-full object-cover" /> : t.name[0]}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate flex items-center gap-1">{t.name}{t.description && <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded-sm max-w-[80px] truncate">{String(t.description)}</span>}</div><div className="text-xs text-slate-500 truncate">{t.role}</div></div>{hasUnreadFromTeacher(t.id) && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}</button>))}</div>)}</div>); })}</div>
          </aside>
          <main className="flex-1 flex flex-col bg-[#f2f4f6]">
            {selectedTeacherId ? (
              <>
                <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedTeacherId(null)}><ArrowLeft size={20} /></button>
                    <span className="text-lg font-bold">{selectedTeacherId === PUBLIC_CHAT_ID ? "📢 전체 대화방 (공용)" : `${activeTeacher?.name} 선생님`}</span>

                    {/* [버튼 추가] 공용 채팅방이 아니고 선생님이 선택되었을 때 포인트 관리 버튼 표시 */}
                    {selectedTeacherId !== PUBLIC_CHAT_ID && activeTeacher && (
                      <button
                        onClick={() => setShowStaffProfileModal(true)}
                        className="ml-2 flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
                      >
                        <Gift size={12} /> 포인트 관리
                      </button>
                    )}
                  </div>
                  <button onClick={() => { setSelectedTeacherId(null); setAdminFilter(null); }} className="text-slate-400 hover:text-indigo-600 transition-colors"><Home size={20} /></button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 bg-[#b2c7d9]">{currentMessages.map(m => <MessageBubble key={m.id} message={m} isMe={m.senderType === 'ADMIN'} currentMode="ADMIN" couriers={couriers} staffList={staffList} />)}<div ref={chatEndRef}></div></div>
                <div className="bg-white p-3 flex gap-2 border-t border-slate-200"><input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage(input)} className="flex-1 rounded-full px-4 py-2 text-sm bg-slate-100 outline-none" /><button onClick={() => handleSendMessage(input)} className="bg-[#fee500] rounded-full w-10 h-10 flex items-center justify-center"><Send size={18} /></button></div>
              </>
            ) : adminMainView === 'DASHBOARD' ? (
              <div className="flex-1 p-8 overflow-y-auto"><div className="w-full max-w-2xl"><div className="flex justify-end mb-4"><button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-1 bg-white hover:bg-slate-50 text-indigo-600 font-bold py-2 px-4 rounded-xl shadow-sm border border-indigo-100 transition-all text-sm"><Plus size={16} /> 택배 직접 등록</button></div>
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 border border-slate-100"><div className="flex justify-between items-end mb-6 border-b pb-4"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Truck className="text-indigo-600" /> 오늘의 학교 택배 현황</h2><span className="text-sm font-bold text-slate-400">{adminDateString}</span></div><div className="grid grid-cols-2 gap-4 text-center mb-8"><button onClick={() => setAdminFilter('TOTAL')} className="p-5 rounded-2xl border bg-slate-50 hover:bg-slate-100 transition-colors"><p className="text-xs font-bold text-slate-500 mb-2">📦 전체</p><p className="text-3xl font-black">{stats.total}</p></button><button onClick={() => setAdminFilter('WAITING')} className="p-5 rounded-2xl border bg-amber-50 hover:bg-amber-100 transition-colors"><p className="text-xs font-bold text-amber-600 mb-2">⏳ 대기</p><p className="text-3xl font-black">{stats.waiting}</p></button><button onClick={() => setAdminFilter('PROCESSING')} className="p-5 rounded-2xl border bg-blue-50 hover:bg-blue-100 transition-colors"><p className="text-xs font-bold text-blue-600 mb-2">🚚 배송중</p><p className="text-3xl font-black">{stats.processing}</p></button><button onClick={() => setAdminFilter('COMPLETED')} className="p-5 rounded-2xl border bg-emerald-50 hover:bg-emerald-100 transition-colors"><p className="text-xs font-bold text-emerald-600 mb-2">✅ 완료</p><p className="text-3xl font-black">{stats.delivered}</p></button></div>
                  <div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-bold text-slate-700 mb-4">🚀 오늘의 배송 기사님 <span className="text-xs font-normal text-slate-400">(클릭하여 프로필 보기)</span></h3><div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">{couriers.map(c => (<div key={c.id} onClick={() => setSelectedCourierProfile(c)} className="relative group flex flex-col items-center min-w-[100px] bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all"><div className="absolute top-1 right-1 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); setCourierToEdit(c); setShowCourierModal(true); }} className="bg-white/80 p-1 rounded-full text-slate-500 hover:text-blue-600"><Pencil size={10} /></button><button onClick={(e) => { e.stopPropagation(); requestDeleteCourier(c.id); }} className="bg-white/80 p-1 rounded-full text-slate-500 hover:text-red-600"><Trash2 size={10} /></button></div><img src={c.photoUrl} className="w-10 h-10 rounded-full mb-2 object-cover" /><span className="text-xs font-bold mb-1">{c.name}</span><div className="flex flex-wrap justify-center gap-1 w-full">{c.availableSlots.map(s => <span key={s} className="text-[9px] bg-white border px-1 rounded">{s}</span>)}</div></div>))}</div></div></div></div></div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 w-full max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                    <h3 className="font-bold text-slate-800 mb-2">칭찬합니다 게시판 🎉</h3>
                    <p className="text-xs text-slate-500 mb-4">우리 학교 배송 기사님들을 칭찬해주세요!<br />따뜻한 말 한마디가 큰 힘이 됩니다.</p>
                    <button onClick={() => setShowWritePostModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-colors w-full flex items-center justify-center gap-2">
                      <Pencil size={16} /> 칭찬 글 쓰기
                    </button>
                  </div>
                  {posts.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs">아직 등록된 칭찬 글이 없습니다.</div>) : (posts.map(post => (<div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"> <div className="flex justify-between items-start mb-3"> <div className="flex items-center gap-2"> <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{post.authorName[0]}</div> <div> <p className="text-xs font-bold text-slate-800">{post.authorName} <span className="text-[10px] font-normal text-slate-400">({post.authorRole === 'TEACHER' ? '선생님' : '학생'})</span></p> <p className="text-[10px] text-slate-400">{new Date(getSeconds(post.createdAt) * 1000).toLocaleDateString()}</p> </div> </div> <div className="flex items-center gap-2"><div className="bg-rose-50 text-rose-500 px-2 py-1 rounded-lg text-[10px] font-bold">To. {post.targetCourierName} 기사님</div>{(mode as string) === 'ADMIN' && <button onClick={() => handleDeletePost(post.id)} className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="게시글 삭제"><Trash2 size={13} /></button>}</div> </div> <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p> <div className="flex items-center gap-4 border-t border-slate-50 pt-3"> <button onClick={() => handleLikePost(post.id, post.likes)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.likes.includes(currentUser?.id || "") ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} > <Heart size={14} className={post.likes.includes(currentUser?.id || "") ? "fill-rose-500" : ""} /> {post.likes.length} </button> <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors" > <MessageSquare size={14} /> 댓글 {comments.filter(c => c.postId === post.id).length} </button> </div> {expandedPostId === post.id && (<div className="mt-3 pt-3 border-t border-slate-50 animate-in fade-in slide-in-from-top-1"> <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar"> {comments.filter(c => c.postId === post.id).map(comment => (<div key={comment.id} className="bg-slate-50 p-2.5 rounded-xl"> <div className="flex justify-between items-center mb-1"> <span className="text-[10px] font-bold text-slate-700">{comment.authorName}</span> <div className="flex items-center gap-2"><span className="text-[9px] text-slate-400">{new Date(getSeconds(comment.createdAt) * 1000).toLocaleDateString()}</span>{(mode as string) === 'ADMIN' && <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500" title="댓글 삭제"><Trash2 size={10} /></button>}</div> </div> <p className="text-xs text-slate-600">{comment.content}</p> </div>))} </div> <div className="flex gap-2"> <input value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="댓글을 입력하세요..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)} /> <button onClick={() => handleAddComment(post.id)} className="bg-indigo-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-indigo-700">등록</button> </div> </div>)} </div>)))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  const availableDeliveries = allParcels.filter(p => p.status === 'WAITING');
  const myDeliveries = allParcels.filter(p => p.courierName === name && p.status === 'DELIVERING');
  const completedDeliveries = allParcels.filter(p => p.status === 'COMPLETED' && (mode === 'TEACHER' ? p.receiverId === currentUser?.id : p.courierName === name));
  const myProfile = couriers.find(c => c.name === name);
  const myStats = mode === 'STUDENT' ? calculateCourierStats(name) : null;
  const dateString = currentTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      {notificationComponent}

      {/* [PWA 설치 팝업] */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Rocket className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">바탕화면에 로켓톡 설치 🚀</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                바탕화면이나 홈 화면에 로켓톡을 설치하면<br />새 택배가 올 때마다 <b>알림(빨간 점)</b>을<br />가장 빠르게 띄워드립니다!
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-indigo-200 transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
                >
                  <Download size={18} />
                  바로 설치하기
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition-colors"
                >
                  나중에 하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courier Hover Popup - fixed position to escape overflow:auto clipping */}
      {hoveredCourier && (() => {
        const { courier, stats, rect } = hoveredCourier;
        const popupWidth = 192;
        const left = Math.min(Math.max(rect.left + rect.width / 2 - popupWidth / 2, 8), window.innerWidth - popupWidth - 8);
        return (
          <div className="fixed z-[9999] w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 pointer-events-none" style={{ left, top: rect.top - 8, transform: 'translateY(-100%)' }}>
            <div className="flex flex-col items-center gap-2">
              <img src={courier.photoUrl} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white" alt={courier.name} />
              <div className="text-center">
                <p className="font-bold text-slate-800 text-sm">{courier.name} 기사님</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{String(courier.description || '안전 배송!')}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5 w-full justify-center">
                <span className="text-base">{stats.level.emoji}</span>
                <span className="text-xs font-bold text-slate-700">{stats.level.name}</span>
                <span className="text-[10px] text-slate-400 ml-1">· {stats.deliveredCount}건</span>
              </div>
              {stats.avgRating > 0 && <div className="text-[10px] text-amber-500 font-bold">⭐ {stats.avgRating.toFixed(1)} / 5.0</div>}
              <div className="flex flex-wrap justify-center gap-1 w-full">
                {courier.availableSlots.map((s: string) => <span key={s} className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-md font-medium">{s}</span>)}
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45" />
          </div>
        );
      })()}

      {/* PWA 설치 유도 팝업 */}
      {showInstallPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowInstallPrompt(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-3 relative z-10">🚀</div>
              <h3 className="text-white font-black text-xl relative z-10">로켓톡 앱 설치하기</h3>
              <p className="text-blue-100 text-sm mt-2 relative z-10">바탕화면에 아이콘을 추가하고<br/>1초 만에 로켓톡을 실행하세요!</p>
            </div>
            <div className="p-5 flex gap-2">
              <button onClick={() => setShowInstallPrompt(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
                다음에
              </button>
              <button onClick={handleInstallClick} className="flex-[2] py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors">
                바탕화면에 설치
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 택배 도착 알림 팝업 */}
      {showArrivalPopup && arrivalParcels.length > 0 && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowArrivalPopup(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-6 pb-8 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -right-8 top-8 w-16 h-16 bg-white/10 rounded-full" />
              <button onClick={() => setShowArrivalPopup(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📦</div>
                <div>
                  <p className="text-white/80 text-xs font-medium">새 알림</p>
                  <h2 className="text-white font-black text-lg">택배가 도착했어요!</h2>
                </div>
              </div>
              <p className="text-white/70 text-xs mt-3 relative z-10">{arrivalParcels.length}건의 택배가 배송 신청을 기다리고 있습니다.</p>
            </div>

            {/* 택배 목록 */}
            <div className="px-4 -mt-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 max-h-52 overflow-y-auto">
                {arrivalParcels.map(parcel => (
                  <div key={parcel.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package size={16} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{parcel.itemName}</p>
                      <p className="text-[10px] text-slate-400">보낸사람: {parcel.sender} · {parcel.location}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full whitespace-nowrap">대기중</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="p-4 flex gap-2">
              <button
                onClick={() => setShowArrivalPopup(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                나중에 확인
              </button>
              <button
                onClick={async () => {
                  setShowArrivalPopup(false);
                  // 첫 번째 PENDING 파셀 배송 신청
                  const first = arrivalParcels[0];
                  if (first?.id) {
                    try {
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'parcels', first.id), { status: 'WAITING' });
                      setNotification({ msg: `📦 ${first.itemName} 배송 신청 완료!`, type: 'success' });
                    } catch (e) { console.error(e); }
                  }
                }}
                className="flex-2 flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Package size={16} /> 바로 배송 신청하기!
              </button>
            </div>
          </div>
        </div>
      )}

      <ImagePreviewModal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} imageUrl={previewImage || ""} />


      <DeliveryChecklistModal isOpen={showChecklistModal} onClose={() => setShowChecklistModal(false)} onConfirm={handleChecklistConfirmed} parcel={checklistParcel} />
      <JournalViewModal isOpen={journalViewData.open} onClose={() => setJournalViewData({ ...journalViewData, open: false })} text={journalViewData.text} title={journalViewData.title} />

      <CourierProofModal isOpen={showProofModal} onClose={() => setShowProofModal(false)} onComplete={handleCompleteDelivery} receiverName={allParcels.find(p => p.id === targetParcelId)?.receiver || ""} />

      {showReceiptModal && receiptData && (
        <DeliveryReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            // Only open Journal if NOT from history
            if (!receiptFromHistory) {
              setShowJournalModal(true);
            }
            setReceiptFromHistory(false); // Reset flag
          }}
          onNext={() => {
            setShowReceiptModal(false);
            // Only open Journal if NOT from history
            if (!receiptFromHistory) {
              setShowJournalModal(true);
            }
            setReceiptFromHistory(false); // Reset flag
          }}
          parcel={receiptData.parcel}
          proofUrl={receiptData.proofUrl}
          courier={receiptData.courier}
        />
      )}

      {showJournalModal && <CourierJournalModal isOpen={showJournalModal} onClose={() => setShowJournalModal(false)} onSave={handleSaveJournal} parcel={journalTargetParcel} />}
      {showJournalModal && <CourierJournalModal isOpen={showJournalModal} onClose={() => setShowJournalModal(false)} onSave={handleSaveJournal} parcel={journalTargetParcel} />}

      {showShopModal && (
        <RocketShopModal
          isOpen={showShopModal}
          onClose={() => setShowShopModal(false)}
          userPoints={mode === 'TEACHER' ? (currentUser?.points || 0) : (myProfile?.points || 0)}
          onPurchase={handlePurchase}
          items={shopItems}
          onOpenBackpack={() => setShowBackpackModal(true)}
          isTeacher={mode === 'TEACHER'}
          onGift={handleStartGift}
        />
      )}

      {showGiftStudentModal && (
        <GiftStudentModal
          isOpen={showGiftStudentModal}
          onClose={() => setShowGiftStudentModal(false)}
          couriers={couriers}
          onSelect={handleConfirmGift}
        />
      )}

      {showWritePostModal && (
        <WritePostModal
          onClose={() => {
            setShowWritePostModal(false);
            setInitialCourierName(""); // Reset after close
          }}
          couriers={couriers}
          onPost={handleCreatePost}
          authorName={name}
          initialCourierName={initialCourierName}
        />
      )}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        couriers={couriers}
      />

      <RocketBackpackModal isOpen={showBackpackModal} onClose={() => setShowBackpackModal(false)} items={myProfile?.inventory || []} onUseItem={handleUseItem} />
      <StatsInfoModal isOpen={showStatsInfoModal} onClose={() => setShowStatsInfoModal(false)} />
      <CompletedHistoryModal
        isOpen={showCompletedHistoryModal}
        onClose={() => setShowCompletedHistoryModal(false)}
        parcels={completedDeliveries}
        onShowImage={(url) => setPreviewImage(url)}
        onWriteJournal={(parcel) => { setJournalTargetParcel(parcel); setShowJournalModal(true); }}
        onPrintReceipt={(parcel: Parcel) => {
          setReceiptFromHistory(true); // Flag to prevent journal modal from opening
          // Find the actual courier who delivered this parcel
          const originalCourier = couriers.find(c => c.name === parcel.courierName);
          setReceiptData({
            parcel: parcel,
            proofUrl: parcel.proofImage || "",
            courier: originalCourier // Pass the actual courier
          });
          setShowReceiptModal(true);
        }}
      />

      <div className="w-full max-w-md h-[850px] bg-white shadow-2xl overflow-hidden relative flex flex-col sm:rounded-[3rem] sm:border-[8px] sm:border-slate-800">
        <header className={`px-6 pt-10 pb-4 z-10 sticky top-0 ${activeTab === 'HOME' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 border-b border-slate-100'}`}>
          <div className="flex justify-between items-start mb-2">
            <div><p className={`text-sm font-medium ${activeTab === 'HOME' ? 'opacity-80' : 'text-slate-400'}`}>{activeTab === 'BOARD' ? "칭찬합니다" : activeTab === 'CHAT' ? (activeChannelId ? "대화방" : "소통해요!") : activeTab === 'MYPAGE' ? "내 정보" : "오늘도 힘차게! 🚀"}</p><h1 className="text-2xl font-black mt-1">{activeTab === 'BOARD' ? "따뜻한 말 한마디" : activeTab === 'CHAT' ? (activeChannelId ? "채팅" : "대화 목록") : activeTab === 'MYPAGE' ? "나의 프로필" : `${name} ${mode === 'STUDENT' ? '기사님' : '선생님'}`}</h1></div>
            <button onClick={handleLogout} className={`${activeTab === 'HOME' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'} p-2 rounded-full`}><LogOut size={18} /></button>
          </div>
          {activeTab === 'HOME' && mode === 'STUDENT' && (<div className="flex gap-4 mt-4 text-center"><div className="flex-1 bg-white/10 rounded-xl p-2"><p className="text-2xl font-bold">{myDeliveries.length}</p><p className="text-xs opacity-70">배송 중</p></div><div onClick={() => setShowCompletedHistoryModal(true)} className="flex-1 bg-white/10 rounded-xl p-2 cursor-pointer hover:bg-white/20 transition-colors"><p className="text-2xl font-bold">{completedDeliveries.length}</p><p className="text-xs opacity-70">오늘 완료 (보기)</p></div></div>)}
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 pb-20 scrollbar-hide">
          {activeTab === 'HOME' && (
            <div className="p-4 space-y-6">
              {/* Teacher Mode View */}
              {mode === 'TEACHER' && (
                <>
                  <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
                    <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-lg">내 택배 현황</h2><div className="bg-white/20 p-2 rounded-full"><Package size={20} className="text-white" /></div></div>
                    <div className="flex justify-between text-center text-xs"><div onClick={() => document.getElementById('my-parcel-list')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"><p className="text-xl font-bold underline decoration-white/30 underline-offset-4">{myParcels.filter(p => p.status === 'PENDING').length}</p><span className="opacity-70">도착</span></div><div className="w-[1px] bg-white/20"></div><div onClick={() => handleTrackingClick('WAITING')} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"><p className="text-xl font-bold underline decoration-white/30 underline-offset-4">{myParcels.filter(p => p.status === 'WAITING').length}</p><span className="opacity-70">접수</span></div><div className="w-[1px] bg-white/20"></div><div onClick={() => handleTrackingClick('DELIVERING')} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"><p className="text-xl font-bold underline decoration-white/30 underline-offset-4">{myParcels.filter(p => p.status === 'DELIVERING').length}</p><span className="opacity-70">배송중</span></div><div className="w-[1px] bg-white/20"></div><div onClick={() => setShowCompletedHistoryModal(true)} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"><p className="text-xl font-bold underline decoration-white/30 underline-offset-4">{myParcels.filter(p => p.status === 'COMPLETED').length}</p><span className="opacity-70">완료 (보기)</span></div></div>
                  </div>

                  {/* [NEW] Teacher Shop Banner */}
                  <div onClick={() => setShowShopModal(true)} className="bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl p-5 text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold opacity-90 mb-1">🎁 선생님 선물 상점</p>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Coins size={20} className="fill-yellow-300 text-yellow-300" />
                          {currentUser?.points || 0} P
                        </h3>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <Gift size={24} className="text-white" />
                      </div>
                    </div>
                    <p className="text-[10px] mt-3 opacity-80 bg-black/10 px-2 py-1 rounded inline-block">
                      ✨ 배송 1건 완료 시 +50P 적립
                    </p>
                  </div>

                  <div><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Truck size={16} className="text-indigo-600" /> 활동 중인 기사님</h3><div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{couriers.map(courier => { const cStats = calculateCourierStats(courier.name); return (<div key={courier.id} onMouseEnter={e => setHoveredCourier({ courier, stats: cStats, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() })} onMouseLeave={() => setHoveredCourier(null)} onClick={() => { setActiveTab('BOARD'); setInitialCourierName(courier.name); setShowWritePostModal(true); }} className="min-w-[140px] bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center cursor-pointer hover:bg-slate-50 transition-colors group relative"><div className="relative mb-2 mt-4"><img src={courier.photoUrl} className="w-12 h-12 rounded-full bg-slate-100 object-cover object-top shadow-md" alt={courier.name} /><div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white z-10"></div><div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${cStats.level.color} border-2 border-white z-10`}>{cStats.level.emoji}</div></div><p className="text-xs font-bold text-slate-800">{courier.name}</p><p className="text-[10px] text-slate-500 mt-1 text-center line-clamp-1 w-full px-1">"{String(courier.description || "안전 배송!")}"</p><div className="flex flex-wrap justify-center gap-1 mt-2 w-full">{courier.availableSlots.map(s => <span key={s} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded whitespace-nowrap">{s}</span>)}</div></div>); })}</div></div>
                  <div id="my-parcel-list" className="scroll-mt-28"><h3 className="font-bold text-slate-800 mb-3">내 물품 목록</h3><div className="space-y-3">{myParcels.length === 0 ? <p className="text-xs text-center text-slate-400 py-4">도착한 택배가 없습니다.</p> : myParcels.map(parcel => (<div key={parcel.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><div className="flex justify-between items-start mb-2"><ParcelStatusBadge status={parcel.status} /><span className="text-[10px] text-slate-400">{parcel.arrivedAt}</span></div><h4 className="font-bold text-slate-900 mb-1">{parcel.itemName}</h4><p className="text-xs text-slate-500 mb-3">보낸사람: {parcel.sender} • 위치: {parcel.location}</p>{parcel.status === 'PENDING' && (<button onClick={() => handleRequestDelivery(parcel.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm mb-2 animate-pulse-fast">🚀 바로 배송 신청하기</button>)}{parcel.status === 'WAITING' && <p className="text-xs text-center text-purple-600 bg-purple-50 py-2 rounded-lg font-bold">기사님 배정을 기다리고 있습니다...</p>}{parcel.status === 'DELIVERING' && <p className="text-xs text-center text-blue-600 bg-blue-50 py-2 rounded-lg font-bold">{parcel.courierName} 학생이 배송 중입니다! 🏃</p>}{parcel.status === 'COMPLETED' && (<div className="text-center p-2 bg-slate-50 rounded-lg text-[10px] text-slate-400">배송 완료되었습니다</div>)}</div>))}</div></div>
                </>
              )}
              {/* Student Mode View */}
              {mode === 'STUDENT' && (
                <>
                  <section className="mb-6">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button onClick={() => setShowShopModal(true)} className="bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center gap-1">
                        <ShoppingBag size={24} className="mb-1 opacity-90" />
                        <span className="text-xs font-medium">포인트 상점</span>
                        <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full mt-1"><Coins size={12} className="inline mr-1" />{myProfile?.points || 0} P</span>
                      </button>
                      <button onClick={() => setShowLeaderboard(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center gap-1">
                        <Trophy size={24} className="mb-1 opacity-90 text-yellow-300" />
                        <span className="text-xs font-medium">배달왕 랭킹</span>
                        <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full mt-1 text-yellow-100">명예의 전당</span>
                      </button>
                    </div>
                  </section>
                  <section><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Bell className="text-indigo-600" size={18} /> 배송 요청 ({availableDeliveries.length})</h3>{availableDeliveries.length === 0 ? <div className="text-center py-6 text-slate-400 text-xs bg-white rounded-2xl border border-slate-100">현재 대기 중인 배송이 없습니다.</div> : availableDeliveries.map(p => (<div key={p.id} className={`bg-white p-4 rounded-2xl shadow-sm border mb-3 ${p.isUrgent ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-100'}`}><div className="flex justify-between mb-2"><span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${p.isUrgent ? 'bg-red-100 text-red-600' : 'text-indigo-600 bg-indigo-50'}`}>{p.isUrgent && <Siren size={12} className="animate-pulse" />} {p.receiver} 선생님</span><span className="text-xs text-slate-400">{p.location}</span></div><p className="text-sm font-bold text-slate-800 mb-4">{p.itemName}</p><button onClick={() => handleAcceptDelivery(p.id)} className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 ${p.isUrgent ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{p.isUrgent ? "🚨 긴급! 제가 갈게요! 🏃" : "제가 갈게요! 🙋‍♂️"}</button></div>))}</section>
                  <section><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Truck className="text-emerald-600" size={18} /> 나의 배송 ({myDeliveries.length})</h3>{myDeliveries.length === 0 ? <div className="text-center py-4 text-slate-400 text-xs">배송 중인 물품이 없습니다.</div> : myDeliveries.map(p => (<div key={p.id} className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100 mb-3"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-emerald-700">{p.receiver} 선생님께 이동 중</span><ParcelStatusBadge status={p.status} /></div><p className="text-sm font-bold text-slate-800 mb-2">{p.itemName}</p><p className="text-xs text-slate-500 mb-4 flex items-center gap-1"><MapPin size={12} /> {p.location}</p><button onClick={() => handleStartCompletion(p)} className="w-full bg-white border border-emerald-200 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"><ClipboardCheck size={16} /> 배송 확인 및 완료 처리</button></div>))}</section>
                </>
              )}
              <div className="space-y-2"><button onClick={() => { Notification.requestPermission().then(perm => { if (perm === 'granted') { setNotification({ msg: "알림 권한 허용됨", type: 'success' }); new Notification("알림 설정 완료", { body: "이제 윈도우 알림을 받을 수 있습니다!" }); } else { alert("알림 권한이 차단되었습니다."); } }); }} className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"><span className="flex items-center gap-3"><Bell size={18} /> 시스템 알림 설정하기</span><div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div></button><button onClick={handleLogout} className="w-full bg-white p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"><LogOut size={18} /> 로그아웃</button></div>
            </div>
          )}
          {activeTab === 'BOARD' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4 w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                  <h3 className="font-bold text-slate-800 mb-2">칭찬합니다 게시판 🎉</h3>
                  <p className="text-xs text-slate-500 mb-4">우리 학교 배송 기사님들을 칭찬해주세요!<br />따뜻한 말 한마디가 큰 힘이 됩니다.</p>
                  <button onClick={() => setShowWritePostModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-colors w-full flex items-center justify-center gap-2">
                    <Pencil size={16} /> 칭찬 글 쓰기
                  </button>
                </div>
                {posts.length === 0 ? (<div className="text-center py-10 text-slate-400 text-xs">아직 등록된 칭찬 글이 없습니다.</div>) : (posts.map(post => (<div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"> <div className="flex justify-between items-start mb-3"> <div className="flex items-center gap-2"> <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{post.authorName[0]}</div> <div> <p className="text-xs font-bold text-slate-800">{post.authorName} <span className="text-[10px] font-normal text-slate-400">({post.authorRole === 'TEACHER' ? '선생님' : '학생'})</span></p> <p className="text-[10px] text-slate-400">{new Date(getSeconds(post.createdAt) * 1000).toLocaleDateString()}</p> </div> </div> <div className="flex items-center gap-2"><div className="bg-rose-50 text-rose-500 px-2 py-1 rounded-lg text-[10px] font-bold">To. {post.targetCourierName} 기사님</div>{(mode as string) === 'ADMIN' && <button onClick={() => handleDeletePost(post.id)} className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="게시글 삭제"><Trash2 size={13} /></button>}</div> </div> <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p> <div className="flex items-center gap-4 border-t border-slate-50 pt-3"> <button onClick={() => handleLikePost(post.id, post.likes)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.likes.includes(currentUser?.id || "") ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} > <Heart size={14} className={post.likes.includes(currentUser?.id || "") ? "fill-rose-500" : ""} /> {post.likes.length} </button> <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors" > <MessageSquare size={14} /> 댓글 {comments.filter(c => c.postId === post.id).length} </button> </div> {expandedPostId === post.id && (<div className="mt-3 pt-3 border-t border-slate-50 animate-in fade-in slide-in-from-top-1"> <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar"> {comments.filter(c => c.postId === post.id).map(comment => (<div key={comment.id} className="bg-slate-50 p-2.5 rounded-xl"> <div className="flex justify-between items-center mb-1"> <span className="text-[10px] font-bold text-slate-700">{comment.authorName}</span> <div className="flex items-center gap-2"><span className="text-[9px] text-slate-400">{new Date(getSeconds(comment.createdAt) * 1000).toLocaleDateString()}</span>{(mode as string) === 'ADMIN' && <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500" title="댓글 삭제"><Trash2 size={10} /></button>}</div> </div> <p className="text-xs text-slate-600">{comment.content}</p> </div>))} </div> <div className="flex gap-2"> <input value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="댓글을 입력하세요..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)} /> <button onClick={() => handleAddComment(post.id)} className="bg-indigo-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-indigo-700">등록</button> </div> </div>)} </div>)))}
              </div>
            </div>
          )}
          {activeTab === 'CHAT' && (
            <div className="flex flex-col h-full bg-[#f2f4f6]">
              {activeChannelId ? (
                <>
                  <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChannelId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
                      {(() => {
                        const channel = chatChannels.find(c => c.id === activeChannelId);
                        if (!channel) return null;
                        if (channel.type === 'PUBLIC') return <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Users size={20} /></div>;
                        if (channel.id === 'gift_box') return <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 text-xl overflow-hidden border border-rose-200">🎁</div>;
                        
                        const photoUrl = mode === 'TEACHER' 
                          ? (couriers.find(c => c.name === channel.parcel?.courierName)?.photoUrl || channel.parcel?.courierPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.parcel?.courierName || 'unknown'}`)
                          : (staffList.find(s => s.name === channel.parcel?.receiver)?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.parcel?.receiver || 'unknown'}`);
                          
                        return <div className="w-10 h-10 rounded-full shrink-0 bg-slate-100 border border-slate-200 overflow-hidden"><img src={photoUrl} className="w-full h-full object-cover" /></div>;
                      })()}
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                          {chatChannels.find(c => c.id === activeChannelId)?.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {chatChannels.find(c => c.id === activeChannelId)?.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {currentMessages.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-50"><MessageIcon size={40} /><p className="text-xs">대화 내역이 없습니다.</p></div>) : (currentMessages.map(m => (<MessageBubble key={m.id} message={m} isMe={m.senderName === name} currentMode={mode} allParcels={allParcels} onRequestDelivery={handleRequestDelivery} onSubmitFeedback={handleSubmitFeedback} onOpenJournal={(text, title) => setJournalViewData({ open: true, text, title })} onWriteJournal={(parcel) => { setJournalTargetParcel(parcel); setShowJournalModal(true); }} couriers={couriers} staffList={staffList} />)))}
                    <div ref={chatEndRef}></div>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0"> <div className="flex gap-2"> <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage(input)} className="flex-1 rounded-full px-4 py-3 text-sm bg-slate-100 outline-none border border-transparent focus:border-indigo-300 transition-colors" placeholder="메시지를 입력하세요..." /> <button onClick={() => handleSendMessage(input)} className="bg-[#fee500] hover:bg-yellow-400 text-slate-900 rounded-full w-12 h-12 flex items-center justify-center shadow-sm transition-transform active:scale-95"> <Send size={20} className="ml-0.5" /> </button> </div> </div>
                </>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Public & System Channels */}
                  {chatChannels.filter(c => c.type !== 'PRIVATE').map((channel: any) => (
                    <div key={channel.id} onClick={() => setActiveChannelId(channel.id)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95 mb-3" >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${channel.type === 'PUBLIC' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {channel.type === 'PUBLIC' ? <Users size={24} /> : (channel.parcel?.courierName ? <img src={couriers.find(c => c.name === channel.parcel?.courierName)?.photoUrl || channel.parcel.courierPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.parcel.courierName}`} className="w-full h-full rounded-full object-cover" /> : <Package size={24} />)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{channel.name}</h3>
                          {channel.date && <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{channel.date}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{channel.subtitle}</p>
                      </div>
                    </div>
                  ))}

                  {/* Private Channels (Delivery) */}
                  {(() => {
                    const privateChannels = chatChannels.filter(c => c.type === 'PRIVATE') as any[];

                    if (mode === 'TEACHER') {
                      const groups: Record<string, typeof privateChannels> = {};
                      privateChannels.forEach(c => {
                        const rawCourierName = c.parcel?.courierName || 'Unknown';
                        const courierName = rawCourierName.trim();
                        if (!groups[courierName]) groups[courierName] = [];
                        groups[courierName].push(c);
                      });

                      const sortedCourierNames = Object.keys(groups).sort((a, b) => {
                        // Sort by most recent message in group ?
                        const lastA = groups[a][0]?.date || ''; // Rough sort
                        const lastB = groups[b][0]?.date || '';
                        return lastB.localeCompare(lastA);
                      });

                      return sortedCourierNames.map(courierName => {
                        const channels = groups[courierName];
                        const isExpanded = expandedCouriers[courierName] ?? false; // Default closed
                        const latestChannel = channels[0];
                        const matchedCourier = couriers.find(c => (c.name || '').trim() === courierName);
                        // matchedCourier의 photoUrl이 유효한지 꼼꼼히 체크. 빈 문자열이거나 유효하지 않으면 fallback
                        let validPhotoUrl = matchedCourier?.photoUrl;
                        if (!validPhotoUrl || validPhotoUrl.trim() === '') {
                          validPhotoUrl = latestChannel.parcel?.courierPhoto;
                        }
                        if (!validPhotoUrl || validPhotoUrl.trim() === '') {
                          validPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${courierName}`;
                        }
                        const courierPhoto = validPhotoUrl;
                        const activeCount = channels.filter(c => c.parcel?.status !== 'COMPLETED').length;

                        return (
                          <div key={courierName} className="mb-3 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all relative">
                            {/* Header */}
                            <div onClick={() => toggleCourierGroup(courierName)} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                              <div className="relative w-12 h-12 shrink-0 group/avatar">
                                <img src={courierPhoto} className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100 transition-all duration-200 hover:shadow-lg" />
                                {/* Hover Popup for chat list */}
                                <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 scale-95 group-hover/avatar:scale-100 z-50">
                                  <div className="flex flex-col items-center gap-2">
                                    <img src={courierPhoto} className="w-14 h-14 rounded-full object-cover shadow border-2 border-white" />
                                    <p className="font-bold text-slate-800 text-xs text-center">{courierName} 기사님</p>
                                    {(() => { const s = calculateCourierStats(courierName); return (<div className="flex items-center gap-1 text-[10px] text-slate-500"><span>{s.level.emoji}</span><span>{s.level.name}</span><span>· {s.deliveredCount}건</span></div>); })()}
                                  </div>
                                  <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45"></div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    {courierName} 기사님
                                    {activeCount > 0 && <span className="bg-emerald-100 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">진행중 {activeCount}</span>}
                                  </h3>
                                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                <p className="text-xs text-slate-500">
                                  총 {channels.length}건의 배송 기록
                                </p>
                              </div>
                            </div>

                            {/* Body */}
                            {isExpanded && (
                              <div className="bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                {channels.map((channel: any) => (
                                  <div key={channel.id} onClick={() => setActiveChannelId(channel.id)} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer border-b border-slate-100 last:border-none">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                      {channel.parcel?.status === 'COMPLETED' ? <CheckCircle size={14} className="text-emerald-500" /> : <img src={courierPhoto} alt="프로필" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-slate-700 truncate">{channel.parcel?.itemName}</p>
                                        <span className="text-[9px] text-slate-400 opacity-70 ml-2 whitespace-nowrap">{channel.date}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate">
                                        {channel.subtitle}
                                      </p>
                                    </div>
                                    {channel.parcel?.status !== 'COMPLETED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    } else {
                      // Student Mode: Flat List (Legacy)
                      return privateChannels.map((channel: any) => (
                        <div key={channel.id} onClick={() => setActiveChannelId(channel.id)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95 mb-3" >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${channel.type === 'PUBLIC' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {channel.parcel?.receiver ? <img src={staffList.find(s => (s.name || '').trim() === (channel.parcel?.receiver || '').trim())?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.parcel.receiver}`} className="w-full h-full rounded-full object-cover" /> : <Package size={24} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <h3 className="font-bold text-slate-800 text-sm truncate">{channel.name}</h3>
                              {channel.date && <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{channel.date}</span>}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{channel.subtitle}</p>
                          </div>
                          {channel.type === 'PRIVATE' && channel.parcel?.status !== 'COMPLETED' && (<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>)}
                        </div>
                      ));
                    }
                  })()}
                  {chatChannels.length === 1 && (<div className="text-center py-10 text-slate-400 text-xs"> <p className="mb-2">진행 중인 배송 대화방이 없습니다.</p> <p>택배를 신청하거나 배송을 시작하면<br />대화방이 생성됩니다.</p> </div>)}
                </div>
              )}
            </div>
          )}
          {activeTab === 'MYPAGE' && (
            <div className="p-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-50 to-white z-0"></div>
                <div className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 bg-slate-100 overflow-hidden group cursor-pointer" onClick={() => document.getElementById('profile-upload')?.click()}>
                  <img src={editProfile.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleLocalPhotoChange} />

                <h2 className="text-xl font-bold text-slate-800 relative z-10">{name} <span className="text-sm font-normal text-slate-500">({mode === 'TEACHER' ? '선생님' : '학생'})</span></h2>
                <p className="text-sm text-indigo-600 font-bold mb-4 relative z-10">{role}</p>

                <div className="w-full space-y-3 relative z-10">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">한줄 소개</label>
                    <input value={editProfile.desc} onChange={(e) => handleLocalDescriptionChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-center" placeholder="상태 메시지를 입력하세요" />
                  </div>
                  {mode === 'STUDENT' && (<div> <label className="text-xs font-bold text-slate-400 mb-2 block text-left">배송 가능 시간</label> <div className="flex flex-wrap gap-2 justify-center"> {TIME_SLOTS.map(slot => (<button key={slot} onClick={() => toggleLocalSlot(slot)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${editProfile.slots.includes(slot) ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`} > {slot} </button>))} </div> </div>)}
                </div>
                {hasChanges && (<button onClick={handleSaveProfile} className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all animate-bounce"> 변경사항 저장하기 </button>)}
              </div>
              {mode === 'STUDENT' && myStats && (
                <>
                  <div className="flex items-center justify-between mb-2 px-1"> <h3 className="font-bold text-slate-800">나의 활동 지표</h3> <button onClick={() => setShowStatsInfoModal(true)} className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm"> <Info size={12} /> 기준 보기 </button> </div>
                  <div className="grid grid-cols-2 gap-3 mb-4"> <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"> <div className="text-2xl mb-1">{myStats.level.emoji}</div> <div className="text-xs text-slate-400">현재 레벨</div> <div className="font-bold text-slate-800">{myStats.level.name}</div> </div> <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"> <div className="text-2xl mb-1">📦</div> <div className="text-xs text-slate-400">누적 배송</div> <div className="font-bold text-slate-800">{myStats.deliveredCount}건</div> </div> <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"> <div className="text-2xl mb-1">⭐</div> <div className="text-xs text-slate-400">평균 평점</div> <div className="font-bold text-slate-800">{myStats.avgRating.toFixed(1)} <span className="text-[10px] text-slate-400">/ 5.0</span></div> </div> <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"> <div className="text-2xl mb-1">🏆</div> <div className="text-xs text-slate-400">획득 뱃지</div> <div className="font-bold text-slate-800">{myStats.badges.length}개</div> </div> </div>
                </>
              )}
            </div>
          )}
        </main>

        <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-100 py-2 px-6 pb-6 flex justify-between items-center z-20">
          <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'HOME' ? 'text-slate-900' : 'text-slate-400'}`}><Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} /><span className="text-[10px] font-medium">홈</span></button>
          <button onClick={() => setActiveTab('BOARD')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'BOARD' ? 'text-slate-900' : 'text-slate-400'}`}><Layout size={24} strokeWidth={activeTab === 'BOARD' ? 2.5 : 2} /><span className="text-[10px] font-medium">게시판</span></button>
          <button onClick={() => { setActiveTab('CHAT'); setActiveChannelId(null); }} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'CHAT' ? 'text-slate-900' : 'text-slate-400'} relative`}><div className="relative"><MessageCircle size={24} strokeWidth={activeTab === 'CHAT' ? 2.5 : 2} />{unreadNoticeCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">N</div>}</div><span className="text-[10px] font-medium">채팅</span></button>
          <button onClick={() => setActiveTab('MYPAGE')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'MYPAGE' ? 'text-slate-900' : 'text-slate-400'}`}><User size={24} strokeWidth={activeTab === 'MYPAGE' ? 2.5 : 2} /><span className="text-[10px] font-medium">내 정보</span></button>
        </nav>
      </div>
    </div>
  );
}
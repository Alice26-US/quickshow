import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, BookOpen, Video, PlayCircle, ShieldCheck, ListChecks, X, Download, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';

const FREE_VIDEO_PREVIEW_SECONDS = 30;
const VIDEO_PREVIEW_STORAGE_PREFIX = "quicklearn-video-preview-seconds";
const ANSWER_REVIEW_BATCH_SIZE = 5;
const FREE_FLASHCARD_PREVIEW_COUNT = 5;
const OFFLINE_SESSION_PREFIX = "quickshow-offline-session";
const OFFLINE_MEDIA_CACHE = "quickshow-offline-media-v1";

const getOfflineSessionKey = (sessionId) => `${OFFLINE_SESSION_PREFIX}:${sessionId}`;

const readOfflineSessionSnapshot = (sessionId) => {
    if (!sessionId) return null;
    try {
        const raw = localStorage.getItem(getOfflineSessionKey(sessionId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.session?.topicId) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeOfflineSessionSnapshot = (sessionId, payload) => {
    if (!sessionId || !payload?.session?.topicId) return;
    try {
        localStorage.setItem(getOfflineSessionKey(sessionId), JSON.stringify({
            ...payload,
            savedAt: new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Failed to save offline session snapshot", error);
    }
};

const hasActiveSubscription = (candidateUser) => {
    if (!candidateUser) return false;
    if (candidateUser.subscriptionEndAt) {
        return new Date(candidateUser.subscriptionEndAt) > new Date();
    }
    return Boolean(candidateUser.isPro);
};

const normalizeFlashcard = (card = {}) => {
    const frontContext = String(
        card.frontContext ?? card.front ?? card.question ?? card.prompt ?? card.term ?? card.context ?? ''
    ).trim();

    const backAnswer = String(
        card.backAnswer ?? card.back ?? card.answer ?? card.definition ?? card.response ?? card.solution ?? ''
    ).trim();

    return { frontContext, backAnswer };
};

const RevisionSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?._id;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
    const [offlineVideoUrls, setOfflineVideoUrls] = useState({});
    const [offlineRefreshToken, setOfflineRefreshToken] = useState(0);
    const [downloadingOffline, setDownloadingOffline] = useState(false);
    const [offlineProgress, setOfflineProgress] = useState({ done: 0, total: 0 });
    
    // Auth State
    const [isPro, setIsPro] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState({ show: false, limit: '' });
    const [showAnswerReview, setShowAnswerReview] = useState(false);
    const [reviewedCards, setReviewedCards] = useState({});
    const [currentBatchStart, setCurrentBatchStart] = useState(0);
    const [previewSecondsUsed, setPreviewSecondsUsed] = useState(0);
    const previewSecondsUsedRef = useRef(0);
    const lastTrackedVideoTimeRef = useRef(0);
    
    // UI State tabs
    const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'flashcards'

    // AI Chat State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    // Flashcard State
    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);

    // Video Playlist State
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const previewStorageKey = userId ? `${VIDEO_PREVIEW_STORAGE_PREFIX}:${userId}` : null;

    const toMediaUrl = useCallback((filepath) => {
        if (!filepath) return "";
        if (/^https?:\/\//i.test(filepath)) return filepath;
        return filepath.startsWith("/") ? `${API_ORIGIN}${filepath}` : `${API_ORIGIN}/${filepath}`;
    }, [API_ORIGIN]);

    const persistPreviewSeconds = useCallback((nextSeconds) => {
        const safeValue = Math.min(FREE_VIDEO_PREVIEW_SECONDS, Math.max(0, nextSeconds));
        previewSecondsUsedRef.current = safeValue;
        setPreviewSecondsUsed(safeValue);
        if (previewStorageKey) {
            localStorage.setItem(previewStorageKey, String(safeValue));
        }
    }, [previewStorageKey]);

    const openVideoLimitModal = () => {
        if (!showUpgradeModal.show) {
            setShowUpgradeModal({ show: true, limit: 'video' });
        }
    };

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    useEffect(() => {
        return () => {
            Object.values(offlineVideoUrls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [offlineVideoUrls]);

    useEffect(() => {
        setOfflineProgress({ done: 0, total: 0 });
        setDownloadingOffline(false);
        setOfflineRefreshToken(0);
        setOfflineVideoUrls((prev) => {
            Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
            return {};
        });
        setReviewedCards({});
        setShowAnswerReview(false);
        setCurrentBatchStart(0);
        setCurrentCard(0);
        setFlipped(false);
    }, [id]);

    useEffect(() => {
        if (!previewStorageKey) return;
        const saved = Number(localStorage.getItem(previewStorageKey));
        if (Number.isFinite(saved) && saved > 0) {
            persistPreviewSeconds(saved);
        } else {
            persistPreviewSeconds(0);
        }
    }, [previewStorageKey, persistPreviewSeconds]);

    useEffect(() => {
        const fetchSessionAndUser = async () => {
            let resolvedSession = null;
            try {
                const { data } = await axios.get(`${API_URL}/sessions/${id}`);
                if (data.success) {
                    resolvedSession = data.session;
                    setSession(data.session);
                    if(data.session.chatHistory) {
                        setMessages(data.session.chatHistory);
                    }
                    writeOfflineSessionSnapshot(id, {
                        session: data.session,
                        messages: data.session.chatHistory || [],
                    });
                }
            } catch {
                const offlineSnapshot = readOfflineSessionSnapshot(id);
                if (offlineSnapshot?.session) {
                    resolvedSession = offlineSnapshot.session;
                    setSession(offlineSnapshot.session);
                    setMessages(offlineSnapshot.messages || []);
                    toast.success("Loaded cached session for offline study.");
                } else {
                    toast.error("Failed to load session");
                }
            }

            try {
                if (userId && isOnline) {
                    const userRes = await axios.get(`${API_URL}/users/${userId}`);
                    if (userRes?.data?.success && userRes.data.user) {
                        setIsPro(hasActiveSubscription(userRes.data.user));
                        return;
                    }
                }
                setIsPro(hasActiveSubscription(user));
            } catch {
                setIsPro(hasActiveSubscription(user));
            } finally {
                if (!resolvedSession && !readOfflineSessionSnapshot(id)) {
                    setSession(null);
                }
                setLoading(false);
            }
        };
        fetchSessionAndUser();
    }, [API_URL, id, userId, user, isOnline]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!input.trim()) return;
        if (!isOnline) {
            toast.error("AI tutor needs internet connection.");
            return;
        }

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            // Include context depending on what they are currently viewing
            let contextStr = "Topic: " + (session?.topicId?.title || "Revision");
            if (activeTab === 'flashcards' && reviewFlashcards.length > 0) {
                const contextCard = reviewFlashcards[currentCard];
                contextStr = `Current Flashcard - Front: ${contextCard.frontContext}, Back: ${contextCard.backAnswer}`;
            } else if (activeTab === 'lessons' && videos.length > 0) {
                contextStr = `Currently watching video: ${videos[activeVideoIndex]?.title}`;
            }

            const { data } = await axios.post(`${API_URL}/ai/generate`, {
                messages: [{ role: 'user', content: userMsg }],
                context: contextStr
            });

            if(data.success) {
                const aiMsg = { role: 'assistant', content: data.message };
                setMessages(prev => [...prev, aiMsg]);
                // Save AI message to DB
                await axios.post(`${API_URL}/sessions/chat`, {
                    sessionId: id,
                    role: 'assistant',
                    content: data.message
                });
            }
        } catch {
            toast.error("AI failed to respond");
        } finally {
            setChatLoading(false);
        }
    };

    const topic = session?.topicId;
    const flashcards = useMemo(() => {
        const rawFlashcards = topic?.flashcards || [];
        return rawFlashcards
            .map(normalizeFlashcard)
            .filter((card) => card.frontContext && card.backAnswer);
    }, [topic]);
    const videos = useMemo(
        () => (Array.isArray(topic?.videos) ? topic.videos : []),
        [topic]
    );
    const reviewFlashcards = useMemo(
        () => (isPro ? flashcards : flashcards.slice(0, FREE_FLASHCARD_PREVIEW_COUNT)),
        [flashcards, isPro]
    );
    const currentBatchEnd = Math.min(reviewFlashcards.length, currentBatchStart + ANSWER_REVIEW_BATCH_SIZE);
    const currentBatchFlashcards = useMemo(
        () => reviewFlashcards.slice(currentBatchStart, currentBatchEnd),
        [reviewFlashcards, currentBatchStart, currentBatchEnd]
    );
    const currentBatchSize = currentBatchFlashcards.length;
    const maxNavigableCardIndex = Math.max(currentBatchStart, currentBatchEnd - 1);
    const reviewedInBatchCount = useMemo(
        () =>
            currentBatchFlashcards.reduce(
                (count, _card, idx) => (reviewedCards[currentBatchStart + idx] ? count + 1 : count),
                0
            ),
        [currentBatchFlashcards, reviewedCards, currentBatchStart]
    );
    const canOpenAnswerReview = currentBatchSize > 0 && reviewedInBatchCount >= currentBatchSize;
    const lockedFlashcardsCount = Math.max(0, flashcards.length - reviewFlashcards.length);
    const downloadedVideoCount = Object.keys(offlineVideoUrls).length;
    const hasOfflineSnapshot = Boolean(readOfflineSessionSnapshot(id));
    const isOfflinePackReady = hasOfflineSnapshot && (videos.length === 0 || downloadedVideoCount >= videos.length);
    const currentVideoBlobUrl = offlineVideoUrls[activeVideoIndex] || "";
    const currentVideoSource = currentVideoBlobUrl || toMediaUrl(videos[activeVideoIndex]?.filepath);
    const currentVideoAvailableOffline = Boolean(currentVideoBlobUrl);
    const canPlayCurrentVideo = videos.length > 0 && (isOnline || currentVideoAvailableOffline);

    useEffect(() => {
        if (!session) return;
        writeOfflineSessionSnapshot(id, {
            session,
            messages,
        });
    }, [id, session, messages]);

    useEffect(() => {
        let cancelled = false;
        const loadCachedVideos = async () => {
            if (!videos.length || !("caches" in window)) {
                setOfflineVideoUrls((prev) => {
                    if (Object.keys(prev).length === 0) {
                        return prev;
                    }
                    Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
                    return {};
                });
                return;
            }

            const next = {};
            for (let index = 0; index < videos.length; index += 1) {
                const mediaUrl = toMediaUrl(videos[index]?.filepath);
                if (!mediaUrl) continue;

                try {
                    const matched = await caches.match(mediaUrl);
                    if (!matched) continue;
                    const blob = await matched.blob();
                    if (!blob || blob.size === 0) continue;
                    next[index] = URL.createObjectURL(blob);
                } catch (error) {
                    console.error("Failed to load cached video", error);
                }
            }

            if (cancelled) {
                Object.values(next).forEach((url) => URL.revokeObjectURL(url));
                return;
            }

            setOfflineVideoUrls((prev) => {
                Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
                return next;
            });
        };

        loadCachedVideos();
        return () => {
            cancelled = true;
        };
    }, [videos, toMediaUrl, offlineRefreshToken]);

    const handleDownloadOfflinePack = async () => {
        if (!session?.topicId) {
            toast.error("Session data is not ready yet.");
            return;
        }
        if (!isOnline) {
            toast.error("Connect to internet to download offline content first.");
            return;
        }
        if (!("caches" in window)) {
            toast.error("Offline cache is not supported on this browser.");
            return;
        }

        try {
            setDownloadingOffline(true);
            setOfflineProgress({ done: 0, total: videos.length });

            writeOfflineSessionSnapshot(id, {
                session,
                messages,
            });

            const cache = await caches.open(OFFLINE_MEDIA_CACHE);
            for (let index = 0; index < videos.length; index += 1) {
                const mediaUrl = toMediaUrl(videos[index]?.filepath);
                if (!mediaUrl) {
                    setOfflineProgress((prev) => ({ ...prev, done: prev.done + 1 }));
                    continue;
                }

                try {
                    const response = await fetch(mediaUrl, { cache: "no-store" });
                    if (response.ok || response.type === "opaque") {
                        await cache.put(mediaUrl, response.clone());
                    }
                } catch (error) {
                    console.error(`Failed to cache video ${mediaUrl}`, error);
                } finally {
                    setOfflineProgress((prev) => ({ ...prev, done: prev.done + 1 }));
                }
            }

            setOfflineRefreshToken((prev) => prev + 1);
            toast.success("Offline pack downloaded. Videos and flashcards are now available offline.");
        } catch {
            toast.error("Failed to download offline content.");
        } finally {
            setDownloadingOffline(false);
        }
    };

    const openAnswerReview = () => {
        if (flashcards.length === 0) {
            toast.error("No flashcards available for review.");
            return;
        }
        if (!canOpenAnswerReview) {
            toast.error(`Study all ${currentBatchSize} flashcards in this set first to unlock answers.`);
            return;
        }
        setShowAnswerReview(true);
    };

    const goToNextBatch = () => {
        if (currentBatchEnd >= reviewFlashcards.length) return;
        setCurrentBatchStart(currentBatchEnd);
        setCurrentCard(currentBatchEnd);
        setFlipped(false);
        setShowAnswerReview(false);
    };

    useEffect(() => {
        if (currentCard < currentBatchStart) {
            setCurrentCard(currentBatchStart);
            setFlipped(false);
            return;
        }
        if (currentCard > maxNavigableCardIndex) {
            setCurrentCard(maxNavigableCardIndex);
            setFlipped(false);
        }
    }, [currentCard, currentBatchStart, maxNavigableCardIndex]);

    useEffect(() => {
        if (currentBatchStart < reviewFlashcards.length) return;
        setCurrentBatchStart(0);
    }, [currentBatchStart, reviewFlashcards.length]);

    useEffect(() => {
        if (activeTab !== 'flashcards') return;
        if (currentBatchSize === 0) return;
        if (currentCard < currentBatchStart || currentCard > maxNavigableCardIndex) return;

        setReviewedCards((prev) => {
            if (prev[currentCard]) return prev;
            return { ...prev, [currentCard]: true };
        });
    }, [activeTab, currentCard, currentBatchSize, currentBatchStart, maxNavigableCardIndex]);

    if (loading) return <div className="text-center py-20 text-white min-h-screen">Loading Session...</div>;
    if (!session) return <div className="text-center py-20 text-white min-h-screen">Session not found</div>;

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen grid grid-cols-1 xl:grid-cols-3 gap-8 text-white">
            
            {/* Left Column: Content (Videos & Flashcards Toggling) */}
            <div className="xl:col-span-2 flex flex-col gap-6">

                {/* Tabs */}
                <div className="flex bg-gray-800 p-2 rounded-xl shadow-md border border-gray-700">
                    <button 
                        onClick={() => setActiveTab('lessons')}
                        className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-bold transition-colors ${activeTab === 'lessons' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                        <Video size={20} /> Watch Lessons
                    </button>
                    <button 
                        onClick={() => setActiveTab('flashcards')}
                        className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-bold transition-colors ${activeTab === 'flashcards' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                        <BookOpen size={20} /> Study Flashcards
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="inline-flex items-center gap-2 text-blue-300">
                                <Video size={16} />
                                <span className="font-semibold text-sm">Videos Overview</span>
                            </div>
                            <span className="text-xs text-gray-400">{videos.length} lesson(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                            {isOnline ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-amber-400" />}
                            <span>{isOnline ? "Online" : "Offline"} mode</span>
                            {isOfflinePackReady && (
                                <span className="inline-flex items-center gap-1 text-emerald-300 text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                    <CheckCircle2 size={12} />
                                    Downloaded
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleDownloadOfflinePack}
                            disabled={downloadingOffline || !isOnline}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white text-sm font-semibold transition-colors"
                        >
                            {downloadingOffline ? (
                                <>Downloading {offlineProgress.done}/{offlineProgress.total}</>
                            ) : (
                                <>
                                    <Download size={15} />
                                    Download Videos Offline
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="inline-flex items-center gap-2 text-purple-300">
                                <BookOpen size={16} />
                                <span className="font-semibold text-sm">Flashcards Overview</span>
                            </div>
                            <span className="text-xs text-gray-400">{reviewFlashcards.length} available</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                            Set {Math.floor(currentBatchStart / ANSWER_REVIEW_BATCH_SIZE) + 1}: {Math.min(reviewedInBatchCount, currentBatchSize)} / {currentBatchSize} studied
                        </p>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
                        >
                            <BookOpen size={15} />
                            Open Flashcards
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl min-h-[60vh]">
                    {activeTab === 'lessons' && (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Video Player */}
                            <div className="flex-1">
                                {videos.length > 0 && canPlayCurrentVideo ? (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 relative">
                                        <video 
                                            controls 
                                            key={activeVideoIndex} 
                                            autoPlay 
                                            className="w-full h-full"
                                            onLoadedMetadata={() => {
                                                lastTrackedVideoTimeRef.current = 0;
                                            }}
                                            onPlay={(e) => {
                                                if (!isPro && previewSecondsUsedRef.current >= FREE_VIDEO_PREVIEW_SECONDS) {
                                                    e.target.pause();
                                                    openVideoLimitModal();
                                                }
                                            }}
                                            onTimeUpdate={(e) => {
                                                if (isPro) {
                                                    lastTrackedVideoTimeRef.current = e.target.currentTime;
                                                    return;
                                                }

                                                if (previewSecondsUsedRef.current >= FREE_VIDEO_PREVIEW_SECONDS) {
                                                    e.target.pause();
                                                    openVideoLimitModal();
                                                    return;
                                                }

                                                const currentTime = e.target.currentTime;
                                                const delta = Math.max(0, currentTime - lastTrackedVideoTimeRef.current);
                                                lastTrackedVideoTimeRef.current = currentTime;
                                                if (delta <= 0) return;

                                                const nextUsed = previewSecondsUsedRef.current + delta;
                                                persistPreviewSeconds(nextUsed);

                                                if (nextUsed >= FREE_VIDEO_PREVIEW_SECONDS) {
                                                    e.target.pause();
                                                    openVideoLimitModal();
                                                }
                                            }}
                                            onSeeked={(e) => {
                                                lastTrackedVideoTimeRef.current = e.target.currentTime;
                                            }}
                                        >
                                            <source src={currentVideoSource} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : videos.length > 0 ? (
                                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 italic border border-gray-700">
                                        This video is not available offline yet. Download the offline pack while online.
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 italic">
                                        No videos uploaded.
                                    </div>
                                )}
                                {videos.length > 0 && <h3 className="text-xl font-bold mt-4">{videos[activeVideoIndex].title}</h3>}
                                {!isPro && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        Free preview left: {Math.max(0, Math.ceil(FREE_VIDEO_PREVIEW_SECONDS - previewSecondsUsed))} seconds
                                    </p>
                                )}
                            </div>
                            
                            {/* Playlist Sidebar */}
                            <div className="lg:w-80 bg-gray-800 rounded-xl p-4 border border-gray-700 h-[60vh] overflow-y-auto">
                                <h3 className="text-lg font-bold mb-4 uppercase text-gray-400 text-sm tracking-wider">Lesson Playlist</h3>
                                <div className="space-y-2">
                                    {videos.length === 0 && <p className="text-gray-500 text-sm">Empty Playlist</p>}
                                    {videos.map((vid, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => {
                                                if (!isOnline && !offlineVideoUrls[idx]) {
                                                    toast.error("This video is not downloaded for offline use.");
                                                    return;
                                                }
                                                setActiveVideoIndex(idx);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeVideoIndex === idx ? 'bg-blue-600/20 border border-blue-500 text-blue-300' : 'hover:bg-gray-700 text-gray-300 border border-transparent'}`}
                                        >
                                            <PlayCircle size={18} className="shrink-0" />
                                            <span className="truncate text-sm flex-1">{vid.title}</span>
                                            {offlineVideoUrls[idx] && (
                                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'flashcards' && (
                        <div>
                            {flashcards.length > 0 ? (
                                <div className="flex flex-col items-center">
                                    <div 
                                        onClick={() => setFlipped((prev) => !prev)}
                                        className="w-full max-w-2xl aspect-[3/2] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer p-10 flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        <p className="text-3xl text-center font-medium leading-normal">
                                            {flipped ? reviewFlashcards[currentCard]?.backAnswer : reviewFlashcards[currentCard]?.frontContext}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center mt-8">
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => { setCurrentCard(Math.max(currentBatchStart, currentCard - 1)); setFlipped(false) }}
                                                disabled={currentCard === currentBatchStart}
                                                className="px-6 py-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700 shadow border border-gray-700"
                                            >
                                                Prev Card
                                            </button>
                                            <span className="py-2 text-gray-400 font-mono tracking-widest">{currentCard + 1} / {reviewFlashcards.length}</span>
                                            <button 
                                                onClick={() => { 
                                                    if (currentCard >= maxNavigableCardIndex) {
                                                        if (!isPro && lockedFlashcardsCount > 0 && currentBatchEnd >= reviewFlashcards.length) {
                                                            setShowUpgradeModal({ show: true, limit: 'flashcard' });
                                                            return;
                                                        }
                                                        if (currentBatchEnd < reviewFlashcards.length) {
                                                            toast.error("Finish this set and open answers to continue to the next 5.");
                                                        }
                                                        return;
                                                    }
                                                    setCurrentCard(Math.min(maxNavigableCardIndex, currentCard + 1)); 
                                                    setFlipped(false);
                                                }}
                                                disabled={currentCard === maxNavigableCardIndex}
                                                className="px-6 py-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700 shadow border border-gray-700"
                                            >
                                                Next Card
                                            </button>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-400">
                                            Set {Math.floor(currentBatchStart / ANSWER_REVIEW_BATCH_SIZE) + 1}: Progress to unlock answers {Math.min(reviewedInBatchCount, currentBatchSize)} / {currentBatchSize}
                                        </p>
                                        <button
                                            onClick={openAnswerReview}
                                            disabled={!canOpenAnswerReview}
                                            className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold transition-colors shadow ${canOpenAnswerReview ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-700 cursor-not-allowed text-gray-300'}`}
                                        >
                                            <ListChecks size={16} />
                                            End Session: View Correct Answers
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-32 text-gray-500 italic">No flashcards available for this topic.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: AI Tutor Chat */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl flex flex-col h-[85vh] sticky top-24 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-xl">AI Tutor</h2>
                        <p className="text-sm text-blue-100 opacity-90 line-clamp-1">{topic.title}</p>
                    </div>
                    {flashcards.length > 0 && (
                        <button
                            onClick={openAnswerReview}
                            disabled={!canOpenAnswerReview}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${canOpenAnswerReview ? 'bg-black/25 hover:bg-black/40' : 'bg-black/25 text-blue-100/70 cursor-not-allowed'}`}
                        >
                            <ListChecks size={15} />
                            Review Set {Math.min(reviewedInBatchCount, currentBatchSize)}/{currentBatchSize}
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/30">
                    {messages.length === 0 && (
                        <div className="text-center mt-10">
                            <div className="inline-block p-4 rounded-full bg-blue-900/30 mb-4 text-blue-400">
                                <Send size={32} />
                            </div>
                            <p className="text-gray-400 italic">No chat history. Send a message to start!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-sm' : 'bg-gray-700 border border-gray-600 rounded-tl-sm text-gray-100'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 border border-gray-600 rounded-2xl rounded-tl-sm p-4 animate-pulse">
                                Typing...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-700 shrink-0">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={activeTab==='lessons' ? "Ask about this video..." : "Ask about this flashcard..."}
                            className="flex-1 bg-gray-800 text-white rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 shadow-inner"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || chatLoading}
                            className="absolute right-2 p-2.5 bg-blue-600 rounded-full hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 transition-colors shadow"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Upgrade Modal Overlay */}
            {showUpgradeModal.show && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="mx-auto bg-blue-600/20 w-16 h-16 flex items-center justify-center rounded-full mb-6">
                            <ShieldCheck size={32} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
                        <p className="text-gray-400 mb-8">
                            {showUpgradeModal.limit === 'video' 
                                ? "Free tier includes a 30-second video preview. Subscribe to continue watching: Weekly 500 FCFA, Monthly 2,000 FCFA, Yearly 10,000 FCFA." 
                                : "Free tier is limited to the first 5 questions (flashcards) per topic. Upgrade to unlock the full knowledge base."}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="px-4 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                            >
                                Exit
                            </button>
                            <button 
                                onClick={() => navigate('/upgrade')}
                                className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors"
                            >
                                Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAnswerReview && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Session Answer Review</h3>
                                <p className="text-sm text-gray-400">
                                    Questions {currentBatchStart + 1}-{currentBatchEnd} of {reviewFlashcards.length}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAnswerReview(false)}
                                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                                aria-label="Close answer review"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4">
                            {currentBatchFlashcards.map((card, idx) => (
                                <div key={`${card.frontContext}-${idx}`} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Question {currentBatchStart + idx + 1}</p>
                                    <p className="text-white font-medium mb-3">{card.frontContext}</p>
                                    <p className="text-xs uppercase tracking-wide text-emerald-400 mb-1">Correct Answer</p>
                                    <p className="text-emerald-100">{card.backAnswer}</p>
                                </div>
                            ))}

                            {currentBatchEnd < reviewFlashcards.length && (
                                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <p className="text-emerald-100 text-sm">
                                        Ready for the next {Math.min(ANSWER_REVIEW_BATCH_SIZE, reviewFlashcards.length - currentBatchEnd)} questions.
                                    </p>
                                    <button
                                        onClick={goToNextBatch}
                                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
                                    >
                                        Continue to Next Set
                                    </button>
                                </div>
                            )}

                            {!isPro && lockedFlashcardsCount > 0 && (
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                                    <p className="text-blue-100 text-sm mb-3">
                                        {lockedFlashcardsCount} additional answer(s) are available on Pro.
                                    </p>
                                    <button
                                        onClick={() => navigate('/upgrade')}
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                                    >
                                        Upgrade to unlock all answers
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisionSession;

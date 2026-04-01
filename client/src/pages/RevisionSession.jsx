import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, BookOpen, Video, PlayCircle } from 'lucide-react';

const RevisionSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Auth State
    const [isPro, setIsPro] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState({ show: false, limit: '' });
    
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

    useEffect(() => {
        const fetchSessionAndUser = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/api/sessions/${id}`);
                if (data.success) {
                    setSession(data.session);
                    if(data.session.chatHistory) {
                        setMessages(data.session.chatHistory);
                    }
                }
                
                if (userId) {
                    const userRes = await axios.get(`http://localhost:3000/api/users/${userId}`);
                    if (userRes?.data?.success && userRes.data.user) {
                        setIsPro(userRes.data.user.isPro);
                    }
                }
            } catch (err) {
                toast.error("Failed to load session");
            } finally {
                setLoading(false);
            }
        };
        fetchSessionAndUser();
    }, [id, userId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!input.trim()) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            // Include context depending on what they are currently viewing
            let contextStr = "Topic: " + (session?.topicId?.title || "Revision");
            if (activeTab === 'flashcards' && flashcards.length > 0) {
                const contextCard = flashcards[currentCard];
                contextStr = `Current Flashcard - Front: ${contextCard.frontContext}, Back: ${contextCard.backAnswer}`;
            } else if (activeTab === 'lessons' && videos.length > 0) {
                contextStr = `Currently watching video: ${videos[activeVideoIndex]?.title}`;
            }

            const { data } = await axios.post("http://localhost:3000/api/ai/generate", {
                messages: [{ role: 'user', content: userMsg }],
                context: contextStr
            });

            if(data.success) {
                const aiMsg = { role: 'assistant', content: data.message };
                setMessages(prev => [...prev, aiMsg]);
                // Save AI message to DB
                await axios.post("http://localhost:3000/api/sessions/chat", {
                    sessionId: id,
                    role: 'assistant',
                    content: data.message
                });
            }
        } catch(err) {
            toast.error("AI failed to respond");
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-white min-h-screen">Loading Session...</div>;
    if (!session) return <div className="text-center py-20 text-white min-h-screen">Session not found</div>;

    const topic = session.topicId;
    const flashcards = topic?.flashcards || [];
    const videos = topic?.videos || [];

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

                {/* Main Content Area */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl min-h-[60vh]">
                    {activeTab === 'lessons' && (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Video Player */}
                            <div className="flex-1">
                                {videos.length > 0 ? (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 relative">
                                        <video 
                                            controls 
                                            key={activeVideoIndex} 
                                            autoPlay 
                                            className="w-full h-full"
                                            onTimeUpdate={(e) => {
                                                if (!isPro && e.target.currentTime >= 30) {
                                                    e.target.pause();
                                                    e.target.currentTime = 30; // lock at 30 seconds
                                                    if (!showUpgradeModal.show) {
                                                        setShowUpgradeModal({ show: true, limit: 'video' });
                                                    }
                                                }
                                            }}
                                        >
                                            <source src={`http://localhost:3000/${videos[activeVideoIndex].filepath}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 italic">
                                        No videos uploaded.
                                    </div>
                                )}
                                {videos.length > 0 && <h3 className="text-xl font-bold mt-4">{videos[activeVideoIndex].title}</h3>}
                            </div>
                            
                            {/* Playlist Sidebar */}
                            <div className="lg:w-80 bg-gray-800 rounded-xl p-4 border border-gray-700 h-[60vh] overflow-y-auto">
                                <h3 className="text-lg font-bold mb-4 uppercase text-gray-400 text-sm tracking-wider">Lesson Playlist</h3>
                                <div className="space-y-2">
                                    {videos.length === 0 && <p className="text-gray-500 text-sm">Empty Playlist</p>}
                                    {videos.map((vid, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveVideoIndex(idx)}
                                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeVideoIndex === idx ? 'bg-blue-600/20 border border-blue-500 text-blue-300' : 'hover:bg-gray-700 text-gray-300 border border-transparent'}`}
                                        >
                                            <PlayCircle size={18} className="shrink-0" />
                                            <span className="truncate text-sm">{vid.title}</span>
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
                                        onClick={() => setFlipped(!flipped)}
                                        className="w-full max-w-2xl aspect-[3/2] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer p-10 flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        <p className="text-3xl text-center font-medium leading-normal">
                                            {flipped ? flashcards[currentCard].backAnswer : flashcards[currentCard].frontContext}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center mt-8">
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false) }}
                                                disabled={currentCard === 0}
                                                className="px-6 py-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700 shadow border border-gray-700"
                                            >
                                                Prev Card
                                            </button>
                                            <span className="py-2 text-gray-400 font-mono tracking-widest">{currentCard + 1} / {flashcards.length}</span>
                                            <button 
                                                onClick={() => { 
                                                    if(!isPro && currentCard >= 1) {
                                                        setShowUpgradeModal({ show: true, limit: 'flashcard' });
                                                        return;
                                                    }
                                                    setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1)); 
                                                    setFlipped(false);
                                                }}
                                                disabled={currentCard === flashcards.length - 1}
                                                className="px-6 py-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700 shadow border border-gray-700"
                                            >
                                                Next Card
                                            </button>
                                        </div>
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
                                ? "Free tier is limited to 30 seconds per video lesson. Upgrade to unlock full runtime and continuous streaming." 
                                : "Free tier is limited to the first 2 flashcards per topic. Upgrade to unlock the full knowledge base."}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setShowUpgradeModal({ show: false, limit: '' })}
                                className="px-4 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => navigate('/upgrade')}
                                className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors"
                            >
                                Unlock PRO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisionSession;

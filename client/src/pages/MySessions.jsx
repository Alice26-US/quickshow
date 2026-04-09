import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, PlayCircle, BookOpen, Clock, MailPlus, CalendarClock, MessageSquare } from "lucide-react";
import fallbackThumbnail from "../assets/backgroundImage.png";

const MySessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [sessions, setSessions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [contentRequests, setContentRequests] = useState([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({
    requestType: "video",
    topic: "",
    message: "",
    studentEmail: user?.email || "",
  });

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackThumbnail;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        // Fetch User Sessions
        const sessionRes = await axios.get(`${API_URL}/sessions/my-sessions`, { headers });
        if (sessionRes.data.success) {
           setSessions(sessionRes.data.sessions);
        }

        const requestRes = await axios.get(`${API_URL}/requests/my`, { headers });
        if (requestRes.data.success) {
          setContentRequests(requestRes.data.requests);
        }

        // Fetch Recommendations
        const topicRes = await axios.get(`${API_URL}/topics/list`);
        if (topicRes.data.success) {
           setRecommended(topicRes.data.topics.slice(0, 4));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [API_URL, user]);

  useEffect(() => {
    if (!user?.email) return;
    setRequestForm((prev) => ({
      ...prev,
      studentEmail: prev.studentEmail || user.email,
    }));
  }, [user]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.topic.trim() || !requestForm.message.trim()) {
      toast.error("Please provide topic and request details.");
      return;
    }

    try {
      setSubmittingRequest(true);
      const headers = getAuthHeaders();
      const { data } = await axios.post(
        `${API_URL}/requests`,
        {
          requestType: requestForm.requestType,
          topic: requestForm.topic,
          message: requestForm.message,
          studentEmail: requestForm.studentEmail,
        },
        { headers }
      );

      if (data.success) {
        toast.success("Request sent to admin.");
        setContentRequests((prev) => [data.request, ...prev]);
        setRequestForm((prev) => ({
          ...prev,
          topic: "",
          message: "",
        }));
      } else {
        toast.error(data.message || "Could not send request.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "fulfilled":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "scheduled":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "in_review":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "rejected":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      default:
        return "bg-gray-700/40 text-gray-300 border-gray-600/50";
    }
  };

  if (loading) {
    return <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-gray-950"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-950 font-sans text-gray-100 px-6 lg:px-36">
       <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name?.split(" ")[0] || "Student"}. Pick up where you left off.</p>
       </div>

       {/* Sessions Section */}
       <h2 className="text-xl font-bold text-white mb-6">Recent Enrolments</h2>
       {sessions.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {sessions.map((session) => (
                  <div key={session._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all group flex flex-col cursor-pointer" onClick={() => navigate(`/session/${session._id}`)}>
                      <div className="h-40 bg-gray-800 relative">
                          <img src={session.topicId?.thumbnail || fallbackThumbnail} onError={handleImageError} alt="Topic" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle size={40} className="text-white" />
                          </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-white mb-2">{session.topicId?.title || "Unknown Topic"}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto border-t border-gray-800 pt-3">
                              <span className="flex items-center gap-1"><BookOpen size={14}/> {session.chatHistory?.length || 0} messages</span>
                              <span className="flex items-center gap-1"><Clock size={14}/> Started: {new Date(session.createdAt).toLocaleDateString()}</span>
                          </div>
                      </div>
                  </div>
              ))}
           </div>
       ) : (
           <div className="bg-gray-900/50 border border-dashed border-gray-700/50 rounded-3xl p-10 lg:p-16 text-center mb-16">
               <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={36} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">No Active Sessions</h3>
               <p className="text-gray-400 max-w-lg mx-auto mb-8 text-base">You haven't started any interactive learning sessions yet. Explore our top curated platforms below and kickstart your learning journey</p>
               <button onClick={() => navigate('/topics')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                   Browse Course Topics
               </button>
           </div>
       )}

       <div className="border-t border-gray-800 pt-10 mb-16">
         <h2 className="text-xl font-bold text-white mb-6">Request New Learning Content</h2>
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <form onSubmit={handleSubmitRequest} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <MailPlus size={18} className="text-blue-400" />
                    <p className="font-semibold text-white">Send Request To Admin</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Request Type</label>
                        <select
                            value={requestForm.requestType}
                            onChange={(e) => setRequestForm((prev) => ({ ...prev, requestType: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="video">Video</option>
                            <option value="flashcard">Flashcard</option>
                            <option value="both">Video + Flashcards</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Topic Needed</label>
                        <input
                            value={requestForm.topic}
                            onChange={(e) => setRequestForm((prev) => ({ ...prev, topic: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Example: Cardiac Pharmacology"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Your Email</label>
                        <input
                            type="email"
                            value={requestForm.studentEmail}
                            onChange={(e) => setRequestForm((prev) => ({ ...prev, studentEmail: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Details</label>
                        <textarea
                            rows={4}
                            value={requestForm.message}
                            onChange={(e) => setRequestForm((prev) => ({ ...prev, message: e.target.value }))}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="Describe what exactly you need the admin to add."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submittingRequest}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                    >
                        {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailPlus size={16} />}
                        {submittingRequest ? "Sending..." : "Send Request"}
                    </button>
                </div>
            </form>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <MessageSquare size={18} className="text-purple-400" />
                    <p className="font-semibold text-white">Admin Feedback</p>
                </div>
                {contentRequests.length === 0 ? (
                    <div className="text-sm text-gray-500 border border-dashed border-gray-700 rounded-xl p-6 text-center">
                        No content requests yet.
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                        {contentRequests.map((request) => (
                            <div key={request._id} className="border border-gray-800 rounded-xl p-4 bg-gray-950/50">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs uppercase tracking-wide text-gray-400">{request.requestType}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                                        {String(request.status || "pending").replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-white font-semibold mb-1">{request.topic}</p>
                                <p className="text-sm text-gray-400 mb-3">{request.message}</p>

                                {request.adminFeedback && (
                                    <p className="text-sm text-emerald-200 bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 mb-2">
                                        {request.adminFeedback}
                                    </p>
                                )}

                                {request.videoLink && (
                                    <a
                                        href={request.videoLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-blue-300 hover:underline break-all block mb-2"
                                    >
                                        Video link from admin
                                    </a>
                                )}

                                {request.availableAt && (
                                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                                        <CalendarClock size={12} />
                                        Expected: {new Date(request.availableAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
         </div>
       </div>

       {/* Recommendations Section */}
       {recommended.length > 0 && (
           <div className="border-t border-gray-800 pt-10">
               <h2 className="text-xl font-bold text-white mb-6">Recommended For You</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommended.map((topic) => (
                        <div key={topic._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group" onClick={() => navigate(`/topics/${topic._id}`)}>
                            <div className="h-32 overflow-hidden relative">
                                <img src={topic.thumbnail || fallbackThumbnail} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Topic" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                            </div>
                            <div className="p-5">
                                <span className="text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-1 rounded-full mb-3 inline-block">
                                    {topic.level}
                                </span>
                                <h4 className="text-base font-bold text-white line-clamp-2 leading-tight">{topic.title}</h4>
                            </div>
                        </div>
                    ))}
               </div>
           </div>
       )}

    </div>
  );
};

export default MySessions;

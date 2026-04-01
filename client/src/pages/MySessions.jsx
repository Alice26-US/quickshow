import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Loader2, PlayCircle, BookOpen, Clock } from "lucide-react";

const MySessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch User Sessions
        const sessionRes = await axios.get(`${API_URL}/sessions/my-sessions`, { headers });
        if (sessionRes.data.success) {
           setSessions(sessionRes.data.sessions);
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
  }, [user]);

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
                          <img src={session.topicId?.thumbnail || "https://via.placeholder.com/600x400"} alt="Topic" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

       {/* Recommendations Section */}
       {recommended.length > 0 && (
           <div className="border-t border-gray-800 pt-10">
               <h2 className="text-xl font-bold text-white mb-6">Recommended For You</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommended.map((topic) => (
                        <div key={topic._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer group" onClick={() => navigate(`/topics/${topic._id}`)}>
                            <div className="h-32 overflow-hidden relative">
                                <img src={topic.thumbnail || "https://via.placeholder.com/300x200"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Topic" />
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, MonitorPlay, Calendar } from "lucide-react";

const ListSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
                const { data } = await axios.get(`${API_URL}/sessions/list`);
                if (data.success) {
                    setSessions(data.sessions);
                }
            } catch (err) {
                toast.error("Failed to fetch sessions.");
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(s => 
        (s.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        s._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Student Sessions</h1>
                    <p className="text-gray-400">Review learning sessions and interaction metrics.</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Table Toolbar */}
                <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student or session ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-200"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-950/50 font-semibold border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Session ID</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Topic</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Loading sessions...
                                    </td>
                                </tr>
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-4 text-gray-500">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-gray-400 font-medium pb-2">No sessions found</p>
                                        <p className="text-gray-500 text-sm">We couldn't find any learning sessions matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map((s) => (
                                    <tr key={s._id} className="hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-400">{s._id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                            {s.userId?.image ? (
                                              <img src={s.userId.image} alt="User" className="w-8 h-8 rounded-full border border-gray-700"/>
                                            ) : (
                                              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                                                {(s.userId?.name || "U").charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            {s.userId?.name || "Deleted User"}
                                        </td>
                                        <td className="px-6 py-4 text-blue-400 hover:underline cursor-pointer">
                                            {s.topicId?.title || "Deleted Topic"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={14}/> {new Date(s.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListSessions;

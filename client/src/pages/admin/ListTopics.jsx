import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, MoreVertical, Edit, Trash2, ExternalLink, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const ListTopics = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
                const { data } = await axios.get(`${API_URL}/topics/list`);
                if (data.success) {
                    setTopics(data.topics);
                }
            } catch (err) {
                toast.error("Failed to fetch topics.");
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    const filteredTopics = topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const getLevelBadge = (level) => {
        switch(level.toLowerCase()) {
            case 'advanced': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'intermediate': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
    };

    return (
        <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Topics Registry</h1>
                    <p className="text-gray-400">Manage your deployed educational topic assets.</p>
                </div>
                <Link to="/admin/add-topic" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                    + New Topic
                </Link>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Table Toolbar */}
                <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search topics..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-200"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 font-medium transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-950/50 font-semibold border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Difficulty Level</th>
                                <th className="px-6 py-4 text-center">Video Assets</th>
                                <th className="px-6 py-4 text-center">Flashcards</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Loading topics...
                                    </td>
                                </tr>
                            ) : filteredTopics.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-4 text-gray-500">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-gray-400 font-medium pb-2">No topics found</p>
                                        <p className="text-gray-500 text-sm">We couldn't find any topics matching your search criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTopics.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-200">{t.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{t.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLevelBadge(t.level)}`}>
                                                {t.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono">
                                            {t.videos?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono">
                                            {t.flashcards?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors tooltip" title="Preview Topic">
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors tooltip" title="Edit Topic">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors tooltip" title="Delete Topic">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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

export default ListTopics;

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";

const ListUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            const { data } = await axios.get(`${API_URL}/users/list`);
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const togglePro = async (userId, currentPro) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            const { data } = await axios.post(`${API_URL}/users/toggle-pro`, {
                userId,
                isPro: !currentPro
            });
            if(data.success) {
                toast.success(data.message);
                fetchUsers();
            }
        } catch(err) {
            toast.error("Failed to update user status");
        }
    };

    const filteredUsers = users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Registry & Billing</h1>
                    <p className="text-gray-400">Manage student access and freemium toggles.</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student name or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-200"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-950/50 font-semibold border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Access Level</th>
                                <th className="px-6 py-4 text-right">Admin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                            <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full border border-gray-700"/>
                                            {u.name}
                                        </td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.isPro ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <ShieldCheck size={14}/> QuickLearn Pro
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                                                    <ShieldAlert size={14}/> Free Tier
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => togglePro(u._id, u.isPro)}
                                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                                                    u.isPro ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white'
                                                }`}
                                            >
                                                {u.isPro ? 'Revoke Pro' : 'Grant Pro Access'}
                                            </button>
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

export default ListUsers;

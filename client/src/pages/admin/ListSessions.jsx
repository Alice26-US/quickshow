import React from "react";
import { Search, MonitorPlay, Calendar } from "lucide-react";

const ListSessions = () => {
    // Enterprise mock data for sessions interface
    const mockSessions = [
        { id: "S-10492", user: "Jane Smith", topic: "Advanced System Architecture", duration: "45 mins", date: "April 1, 2026", status: "Completed" },
        { id: "S-10493", user: "Mark Taylor", topic: "Intro to CI/CD", duration: "12 mins", date: "April 1, 2026", status: "Active" },
        { id: "S-10494", user: "Sarah Connor", topic: "Kubernetes Basics", duration: "1h 10m", date: "March 31, 2026", status: "Completed" },
    ];

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
                            {mockSessions.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-400">{s.id}</td>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                                            {s.user.charAt(0)}
                                        </div>
                                        {s.user}
                                    </td>
                                    <td className="px-6 py-4 text-blue-400 hover:underline cursor-pointer">{s.topic}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14}/> {s.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${s.status==='Active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListSessions;

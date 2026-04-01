import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, BookOpen, Video, Activity, ArrowUpRight, ArrowDownRight, FolderOpen } from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            const { data } = await axios.get(`${API_URL}/admin/dashboard`);
            if (data.success) {
                setDashboardData(data);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };
    fetchDashboard();
  }, []);

  const stats = [
    { title: "Total Topics", value: dashboardData?.stats?.totalTopics || 0, change: "Live", increase: true, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Students", value: dashboardData?.stats?.totalUsers || 0, change: "Live", increase: true, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Revisions Hosted", value: dashboardData?.stats?.activeSessions || 0, change: "Live", increase: true, icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Pro Licenses", value: dashboardData?.stats?.proUsers || 0, change: "Live", increase: true, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>
        <p className="text-gray-400 mt-1">Monitor key performance indicators and learning analytics.</p>
      </div>

      {loading ? (
          <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading enterprise metrics...</p>
          </div>
      ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={120} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.increase ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.increase ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
           <div className="space-y-4">
              {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                              {activity.userInitials}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm text-gray-300">
                                  <span className="font-bold text-white">{activity.user}</span> started session: <span className="text-blue-400 cursor-pointer hover:underline">{activity.topic}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(activity.time).toLocaleString()}</p>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="py-8 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                      <FolderOpen size={30} className="mx-auto mb-2 opacity-50" />
                      <p>No recent session activity</p>
                  </div>
              )}
           </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <h2 className="text-xl font-bold mb-4">System Status</h2>
           <div className="space-y-6">
              <div>
                  <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Storage Usage</span>
                      <span className="text-gray-200">45%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Database Load</span>
                      <span className="text-gray-200">12%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">LLM API Quota</span>
                      <span className="text-gray-200">88%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
              </div>
           </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;
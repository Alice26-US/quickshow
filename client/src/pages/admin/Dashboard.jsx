import React from "react";
import { Users, BookOpen, Video, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Dashboard = () => {
  // Mock enterprise data
  const stats = [
    { title: "Total Topics", value: "24", change: "+12%", increase: true, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Students", value: "1,204", change: "+5.4%", increase: true, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Video Assets", value: "142", change: "+2%", increase: true, icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Engagement Rate", value: "68%", change: "-1.2%", increase: false, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>
        <p className="text-gray-400 mt-1">Monitor key performance indicators and learning analytics.</p>
      </div>

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
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">JD</div>
                      <div className="flex-1">
                          <p className="text-sm text-gray-300"><span className="font-bold text-white">John Doe</span> completed session <span className="text-blue-400 cursor-pointer hover:underline">Advanced React UI Patterns</span></p>
                          <p className="text-xs text-gray-500 mt-1">{i * 2} hours ago</p>
                      </div>
                  </div>
              ))}
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
    </div>
  );
};

export default Dashboard;
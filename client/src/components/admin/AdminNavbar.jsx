import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { ExternalLink, User as UserIcon, BookOpen, LogOut } from "lucide-react";

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30">
      <Link to="/">
         <div className="text-2xl font-black tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg">Q</span>
            </div>
            <span className="text-white">Quick<span className="text-blue-500">Learn</span></span>
         </div>
      </Link>
      
      <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors max-md:hidden flex items-center gap-2"><ExternalLink size={16}/> View Site</Link>
          <div className="w-px h-6 bg-gray-800 mx-2 max-md:hidden"></div>
          
          <div className="relative group cursor-pointer">
            <img src={user?.image || assets.profile} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover" />
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 z-50 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
               <button onClick={()=> navigate('/dashboard')} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm transition-colors text-white">
                  <BookOpen size={15}/> Student Dashboard
               </button>
               <button onClick={()=> navigate('/profile')} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm transition-colors text-white">
                  <UserIcon size={15}/> Manage Profile
               </button>
               <button onClick={logout} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm text-red-500 transition-colors">
                  <LogOut size={15}/> Sign Out
               </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
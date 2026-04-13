import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("userId", user._id);
        if (name !== user.name) formData.append("name", name);
        if (password) formData.append("password", password);
        if (file) formData.append("avatar", file);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_URL}/users/profile`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    "Authorization": token ? `Bearer ${token}` : undefined 
                }
            });

            if (data.success) {
                toast.success("Profile updated successfully!");
                setUser(data.user);
                setPassword("");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
         
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-950 flex justify-center items-start">
            <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl mt-4">
                <h1 className="text-2xl font-bold text-blue-500 mb-6">Manage Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                        <img 
                            src={file ? URL.createObjectURL(file) : user?.image || assets.profile} 
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full border-4 border-gray-800 object-cover mb-4" 
                        />
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                           Edit Profile Picture
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input 
                            type="text" 
                            value={user?.email || ""} 
                            disabled 
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password (Optional)</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Leave blank to keep current"
                            autoComplete="new-password"
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields.");
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result && result.success) {
      toast.success("Welcome back!");
      if (result.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.message || "Failed to log in");
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0a0a0a] text-white">
      <div className="max-w-md w-full bg-black/50 border border-gray-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <h2 className="text-3xl font-black mb-6 text-center tracking-tight">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500">
          Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-400">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

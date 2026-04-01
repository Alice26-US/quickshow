import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ShieldCheck, Smartphone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Upgrade = () => {
  const { user } = useAuth();
  const userId = user?._id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [phoneProvider, setPhoneProvider] = useState("MTN Mobile Money");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to upgrade.");
      return;
    }
    
    if(!phoneNumber || phoneNumber.length < 8) {
        toast.error("Please enter a valid phone number");
        return;
    }

    setLoading(true);
    // Mocking an Africa-centric Mobile Money payment
    try {
        // Simulating the USSD confirmation delay
        await new Promise(r => setTimeout(r, 2500));

        const { data } = await axios.post("http://localhost:3000/api/users/checkout", {
            userId: userId,
            phoneProvider,
            phoneNumber
        });

        if (data.success) {
            toast.success("Payment Received! Welcome to QuickLearn PRO.");
            navigate("/topics"); // redirect back to their learning
        } else {
            toast.error(data.message);
        }
    } catch (err) {
        toast.error("Network Error during checkout simulation.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-32 pb-20 px-6 text-white font-sans flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Left column: Sales pitch */}
        <div className="p-4 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 w-max">
                <ShieldCheck size={16} /> Upgrade Available
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">Unlock Full Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PRO</span></h1>
            
            <p className="text-gray-400 text-lg mb-8">
                Your Free Tier contains trial samples of Flashcards and Video streams. Upgrade to access our complete AI Revision modules.
            </p>

            <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-gray-300 text-lg">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" /> Unlimited uninterrupted Video Lessons
                </li>
                <li className="flex gap-3 text-gray-300 text-lg">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" /> Full Flashcard Knowledge Base Access
                </li>
                <li className="flex gap-3 text-gray-300 text-lg">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" /> Priority Contextual AI Tutor Routing
                </li>
            </ul>
        </div>

        {/* Right column: Fake Payment */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
            <p className="text-gray-400 text-sm mb-6 border-b border-gray-800 pb-4">XAF 10,000 / Lifetime Access (Beta)</p>

            <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Provider</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            onClick={() => setPhoneProvider("MTN Mobile Money")}
                            className={`p-4 border rounded-xl cursor-pointer font-bold flex flex-col justify-center items-center gap-2 transition-all ${phoneProvider === "MTN Mobile Money" ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            MTN MoMo
                        </div>
                        <div 
                            onClick={() => setPhoneProvider("Orange Money")}
                            className={`p-4 border rounded-xl cursor-pointer font-bold flex flex-col justify-center items-center gap-2 transition-all ${phoneProvider === "Orange Money" ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            Orange Money
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. 6XX XX XX XX" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">A mock USSD push will immediately succeed.</p>
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 outline-none hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all mt-4"
                >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying USSD Transaction...</> : 'Pay & Upgrade Now'}
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Upgrade;

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ShieldCheck, Smartphone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUBSCRIPTION_PLANS = [
  { id: "weekly", label: "Weekly", price: 500, duration: "7 days" },
  { id: "monthly", label: "Monthly", price: 2000, duration: "30 days" },
  { id: "yearly", label: "Yearly", price: 10000, duration: "365 days" },
];

const PAYMENT_METHODS = [
  {
    id: "mtn-momo",
    label: "MTN MoMo",
    value: "MTN Mobile Money",
    type: "phone",
    placeholder: "e.g. 6XX XX XX XX",
    activeClass: "bg-yellow-500/10 border-yellow-500 text-yellow-500",
  },
  {
    id: "orange-money",
    label: "Orange Money",
    value: "Orange Money",
    type: "phone",
    placeholder: "e.g. 6XX XX XX XX",
    activeClass: "bg-orange-500/10 border-orange-500 text-orange-500",
  },
  {
    id: "card",
    label: "Bank Card",
    value: "Bank Card",
    type: "card",
    placeholder: "e.g. 4000 1234 5678 9010",
    activeClass: "bg-blue-500/10 border-blue-500 text-blue-400",
  },
  {
    id: "paypal",
    label: "PayPal",
    value: "PayPal",
    type: "email",
    placeholder: "e.g. you@example.com",
    activeClass: "bg-cyan-500/10 border-cyan-500 text-cyan-400",
  },
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    value: "Bank Transfer",
    type: "account",
    placeholder: "e.g. Account / reference number",
    activeClass: "bg-emerald-500/10 border-emerald-500 text-emerald-400",
  },
  {
    id: "other",
    label: "Other",
    value: "Other",
    type: "text",
    placeholder: "Enter payment detail",
    activeClass: "bg-violet-500/10 border-violet-500 text-violet-400",
  },
];

const Upgrade = () => {
  const { user } = useAuth();
  const userId = user?._id;
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [paymentDetail, setPaymentDetail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const activePlan = SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlan);
  const selectedPaymentMethod = PAYMENT_METHODS.find((method) => method.value === paymentMethod) || PAYMENT_METHODS[0];
  const resolvedPaymentMethod =
    paymentMethod === "Other" ? customPaymentMethod.trim() : paymentMethod;
  const isPhoneMethod = selectedPaymentMethod.type === "phone";

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to upgrade.");
      return;
    }
    
    if (paymentMethod === "Other" && !customPaymentMethod.trim()) {
        toast.error("Please enter your payment method");
        return;
    }

    if (!paymentDetail.trim()) {
        toast.error("Please enter payment details");
        return;
    }

    if (isPhoneMethod && paymentDetail.replace(/\D/g, "").length < 8) {
        toast.error("Please enter a valid phone number");
        return;
    }

    setLoading(true);
    try {
        const { data } = await axios.post(`${API_URL}/users/checkout`, {
            userId: userId,
            paymentMethod: resolvedPaymentMethod,
            paymentDetail: paymentDetail.trim(),
            // Backward-compatible fields for older backend expectations.
            phoneProvider: resolvedPaymentMethod,
            phoneNumber: paymentDetail.trim(),
            plan: selectedPlan
        });

        if (data.success) {
            const endDate = data.subscription?.endsAt
              ? new Date(data.subscription.endsAt).toLocaleDateString()
              : null;
            toast.success(endDate ? `Payment received. Active until ${endDate}.` : "Payment received. Subscription active.");
            navigate("/topics"); // redirect back to their learning
        } else {
            toast.error(data.message || "Transaction failed.");
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
                <ShieldCheck size={16} /> Cameroon Plans (FCFA)
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">Unlock Full Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PRO</span></h1>
            
            <p className="text-gray-400 text-lg mb-8">
                Watch a 30-second preview for free, then continue with mock payment checkout.
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

        {/* Right column: Payment */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
            <p className="text-gray-400 text-sm mb-6 border-b border-gray-800 pb-4">Choose a plan billed in FCFA (XAF).</p>

            <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Subscription</label>
                    <div className="grid grid-cols-1 gap-3">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <button
                                type="button"
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`w-full p-4 border rounded-xl text-left transition-all ${
                                    selectedPlan === plan.id
                                    ? "bg-blue-500/10 border-blue-500"
                                    : "bg-gray-900 border-gray-800 hover:border-gray-600"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-white">{plan.label}</p>
                                    <p className="font-bold text-blue-300">{plan.price.toLocaleString()} FCFA</p>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{plan.duration} access</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.value)}
                            className={`p-4 border rounded-xl cursor-pointer font-bold flex flex-col justify-center items-center gap-2 transition-all ${
                              paymentMethod === method.value
                                ? method.activeClass
                                : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600"
                            }`}
                          >
                            {method.label}
                          </button>
                        ))}
                    </div>
                </div>

                {paymentMethod === "Other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Custom Method Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Wave, Apple Pay, Google Pay, Crypto"
                      value={customPaymentMethod}
                      onChange={(e) => setCustomPaymentMethod(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                    />
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {isPhoneMethod ? "Phone Number" : "Payment Detail"}
                    </label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            required
                            type="text" 
                            placeholder={selectedPaymentMethod.placeholder}
                            value={paymentDetail}
                            onChange={(e) => setPaymentDetail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Mock payment only (no real money transfer).</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        className="w-full py-4 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                        Exit
                    </button>
                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 outline-none hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Processing Mock Payment...</> : `Pay ${activePlan?.price.toLocaleString()} FCFA`}
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Upgrade;

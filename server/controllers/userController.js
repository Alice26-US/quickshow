import User from '../models/User.js';

// Get user subscription details
export const getUser = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const user = await User.findById(clerkId);
        if(!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
}

// Fetch all users for Admin
export const listUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ success: true, users });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}

// Toggle Pro status manually (by Admin)
export const toggleProStatus = async (req, res) => {
    try {
        const { userId, isPro } = req.body;
        await User.findByIdAndUpdate(userId, { isPro });
        res.json({ success: true, message: "User subscription updated" });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}

// Mock Mobile Money Payment
export const mockPayment = async (req, res) => {
    try {
        const { clerkId, phoneProvider, phoneNumber } = req.body;
        // Mock payment verification logic always accepting 
        if(!phoneNumber || !phoneProvider) {
            return res.json({ success: false, message: "Invalid payment details" });
        }
        
        // Upgrade user
        await User.findByIdAndUpdate(clerkId, { isPro: true });
        
        res.json({ 
            success: true, 
            message: `Mock payment via ${phoneProvider} successful. Upgraded to Pro.` 
        });
    } catch(err) {
        res.json({ success: false, message: "Checkout failed" });
    }
}

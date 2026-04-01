import { Inngest } from "inngest";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({ id: "movie_ticket_booking" });

/* ===============================
   ✅ USER CREATION
================================ */
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk.user.created" }],
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses?.[0]?.email_address || "",
        image: image_url || "",
      };
      await User.create(userData);
      return { success: true };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }
);

/* ===============================
   ✅ USER DELETION
================================ */
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk.user.deleted" }],
  },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  }
);

/* ===============================
   ✅ USER UPDATE
================================ */
const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk.user.updated" }],
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses?.[0]?.email_address || "",
        image: image_url || "",
      };
      await User.findByIdAndUpdate(id, userData, { new: true });
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }
);

/* ===============================
   ✅ EXPORT FUNCTIONS
================================ */
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
];
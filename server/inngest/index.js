import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie_ticket_booking" });

// --- Sync user creation ---
const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-from-clerk", 
    triggers: { event: "clerk.user.created" },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, Image_url } = event.data;
    const userData = {
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: Image_url
    };
    await User.create(userData);
  }
);

// --- Sync user deletion ---
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: { event: "clerk.user.deleted" }, // ✅ triggers must be here
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// --- Sync user update ---
const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk.user.updated" }, // ✅ triggers must be here
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, Image_url } = event.data;
    const userData = {
      _id: id,
      name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      image: Image_url
    };
    await User.findByIdAndUpdate(id, userData);
  }
);

// Export all functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate];
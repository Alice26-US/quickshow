import { Inngest } from "inngest";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({ id: "movie_ticket_booking" });

/* ===============================
   ✅ EXPORT FUNCTIONS (No webhooks needed for local auth)
================================ */
export const functions = [];
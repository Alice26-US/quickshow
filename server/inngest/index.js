import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie tickect booking" });

// Inngest Funtion to save user data to the database when a user signs up
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, 
    {event: "clerk/user.created"},
    async ({ event }) => {
      const {id, first_name, last_name, email_addresses, Image_url } = event.data
      const userData = {
        _id: id,
        name: first_name + " " + last_name,
        email: email_addresses[0].email_address,
        image: Image_url
      }
      await db.User.create(userData)
    } 
)


// Inngest Funtion to delete user data to the database when a user signs up
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" }, 
    {event: "clerk/user.deleted"},
    async ({ event }) => {
        const {id} = event.data
        await db.User.findByIdAndDelete(id)
    } 
)


// Inngest Funtion to update user data to the database when a user signs up
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" }, 
    {event: "clerk/user.updated"},
    async ({ event }) => {
        const {id, first_name, last_name, email_addresses, Image_url } = event.data
      const userData = {
        _id: id,
        name: first_name + " " + last_name,
        email: email_addresses[0].email_address,
        image: Image_url

        }
        await User.findByIdAndUpdate(id, userData)
    } 
)
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];


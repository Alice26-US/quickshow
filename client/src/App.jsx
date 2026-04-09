import React from "react"
import Navbar from "./components/Navbar"
import { Route,  Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Topics from "./pages/Topics"
import TopicDetails from "./pages/TopicDetails"
import RevisionSession from "./pages/RevisionSession"
import MySessions from "./pages/MySessions"
import Upgrade from "./pages/Upgrade"
import Favorite from "./pages/Favorite"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"
import { Toaster } from "react-hot-toast" 
import Footer from "./components/Footer"
import  Layout  from "./pages/admin/Layout"
import Dashboard from "./pages/admin/Dashboard"
import AddTopic from "./pages/admin/AddTopic"
import EditTopic from "./pages/admin/EditTopic"
import ListTopics from "./pages/admin/ListTopics"
import ListSessions from "./pages/admin/ListSessions"
import ListUsers from "./pages/admin/ListUsers"
import ContentRequests from "./pages/admin/ContentRequests"

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith("/admin")
  return (
    <>
    <Toaster />
     { ! isAdminRoute && <Navbar/>}
     <Routes>
       <Route path="/login" element={<Login/>} />
       <Route path="/signup" element={<Signup/>} />
       <Route path="/" element={<Home/>} />
       <Route path="/topics" element={<Topics/>} />
       <Route path="/topics/:id" element={<TopicDetails/>} />
       <Route path="/session/:id" element={<RevisionSession/>} />
       <Route path="/dashboard" element={<MySessions/>} />
       <Route path="/my-sessions" element={<MySessions/>} />
       <Route path="/profile" element={<Profile/>} />
       <Route path="/upgrade" element={<Upgrade/>} />
       <Route path="/favorite" element={<Favorite/>} />
       <Route path="/admin/*" element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="add-topic" element={<AddTopic/>} />
          <Route path="edit-topic/:id" element={<EditTopic/>} />
          <Route path="list-topics" element={<ListTopics/>} />
          <Route path="list-sessions" element={<ListSessions/>} />
          <Route path="list-users" element={<ListUsers/>} />
          <Route path="content-requests" element={<ContentRequests/>} />
       </Route>
     </Routes>
     { ! isAdminRoute && <Footer/>}
    </>
  )
}

export default App

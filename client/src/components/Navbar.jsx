import React, { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import { MenuIcon, BookOpen, XIcon, UserCircle, Moon, Sun } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

const Navbar = () => {

    const [ isOpen, setIsOpen ] = useState(false);
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()

    const navigate = useNavigate()
    const dashboardLink = user?.isAdmin ? "/admin" : "/dashboard"
    const dashboardLabel = user?.isAdmin ? "Admin Panel" : "My Dashboard"

    const navItems = [
      { to: "/", label: "Home", end: true },
      { to: "/topics", label: "Browse Topics" },
      { to: dashboardLink, label: dashboardLabel }
    ]

    const navLinkClass = ({ isActive }) =>
      `relative pb-1 transition-colors ${
        isActive
          ? "text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:rounded-full after:bg-blue-500"
          : "text-gray-200 md:text-gray-300 hover:text-white"
      }`

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-black/50 backdrop-blur-md border-b border-gray-800"> 
     <Link to='/' className="max-md:flex-1">
         <div className="text-2xl font-black tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg">Q</span>
            </div>
            <span className="text-white">Quick<span className="text-blue-500">Learn</span></span>
         </div>
     </Link>

        <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium 
         max-md:text-lg z-50 flex flex-col md:flex-row items-center 
         max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen text-gray-300
         md:rounded-full bg-black/90 md:bg-transparent overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0 '}`}>
    
             <XIcon className="md:hidden absolute top-6 right-6 w-6 h-6 
               cursor-pointer text-white" onClick={()=> setIsOpen(!isOpen)}/>

            {navItems.map((item) => (
              <NavLink
                key={item.label}
                end={item.end}
                to={item.to}
                onClick={()=>  {scrollTo(0,0); setIsOpen(false)}}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
        </div>

    <div className="flex items-center gap-4 md:gap-6" >
         <button
           onClick={toggleTheme}
           className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800 transition-colors"
           title={isDark ? "Switch to light mode" : "Switch to dark mode"}
           aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
         >
           {isDark ? <Sun size={18} /> : <Moon size={18} />}
         </button>
         {/* <SearchIcon className=" max-md:hidden w-6 h-6 cursor-pointer text-gray-300 hover:text-white transition-colors"/> */}
         {
            !user ? (
                  <Link to="/login"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-all shadow-lg shadow-blue-500/20">
                      Sign In
                  </Link>
                  ) : (
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm text-gray-300 hidden md:block">{user?.name}</span>
                  <div className="relative group cursor-pointer">
                    <img src={user?.image || assets.profile} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover" />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                      {user?.isAdmin ? (
                        <button onClick={()=> navigate('/admin')} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm transition-colors text-white">
                          <BookOpen width={15}/> Admin Panel
                        </button>
                      ) : (
                        <button onClick={()=> navigate('/my-sessions')} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm transition-colors text-white">
                          <BookOpen width={15}/> My Revisions
                        </button>
                      )}
                      <button onClick={()=> navigate('/profile')} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800 text-left text-sm transition-colors text-white">
                          <UserCircle width={15}/> Manage Profile
                      </button>
                      <button onClick={logout} className="px-4 py-3 hover:bg-gray-800 text-left text-sm text-red-500 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
             )
         }
         
    </div>

       <MenuIcon className= "max-md:ml-4 md:hidden w-8 h-8 cursor-pointer text-white" onClick={()=> setIsOpen(!isOpen)}/>
    </div>
  )
}    

export default Navbar

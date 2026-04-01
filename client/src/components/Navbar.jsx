import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import { MenuIcon, SearchIcon, BookOpen, XIcon } from "lucide-react"
import { useClerk, UserButton, useUser } from "@clerk/clerk-react"

const Navbar = () => {

    const [ isOpen, setIsOpen ] = useState(false);
    const {user} = useUser()
    const {openSignUp} = useClerk()

    const navigate = useNavigate()

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

            <Link className="hover:text-white transition-colors" onClick={()=>  {scrollTo(0,0); setIsOpen(false)}} to='/'>Home</Link>
            <Link className="hover:text-white transition-colors" onClick={()=>  {scrollTo(0,0); setIsOpen(false)}} to='/topics'>Browse Topics</Link>
            <Link className="hover:text-white transition-colors" onClick={()=>  {scrollTo(0,0); setIsOpen(false)}} to='/dashboard'>My Dashboard</Link>
        </div>

    <div className="flex items-center gap-8" >
         <SearchIcon className=" max-md:hidden w-6 h-6 cursor-pointer text-gray-300 hover:text-white transition-colors"/>
         {
            !user ? (
                  <button onClick={openSignUp}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-all shadow-lg shadow-blue-500/20">
                      Sign In
                  </button>
                  ) : (
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action label="My Revisions"  labelIcon=
                        {<BookOpen width={15}/>} onClick={()=> navigate('/my-sessions')}/>
                    </UserButton.MenuItems>
                 </UserButton>
             )
         }
         
    </div>

       <MenuIcon className= "max-md:ml-4 md:hidden w-8 h-8 cursor-pointer text-white" onClick={()=> setIsOpen(!isOpen)}/>
    </div>
  )
}    

export default Navbar
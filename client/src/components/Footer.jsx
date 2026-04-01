import React from "react"
import assets from "../assets/assets";

const Footer = () => {
  return (
       <footer className="px-6 md:px-16 lg:px-36 mt-40 w-full text-gray-300">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b
             border-gray-500 pb-14">
                <div className="md:max-w-96">
                    <div className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-lg">Q</span>
                        </div>
                        <span className="text-white">Quick<span className="text-blue-500">Learn</span></span>
                    </div>
                    <p className="mt-6 text-sm text-gray-400">
                        Built with ❤️ in Douala, Cameroon. We are dedicated to providing accessible, high-quality, and AI-enabled educational tools to empower students across the nation and beyond.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <img src={assets.googlePlay} alt="google play" className="h-9 w-auto" />
                        <img src={assets.appStore} alt="app store" className="h-9 w-auto" />
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Contact us</a></li>
                            <li><a href="#">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5 text-white">Get in touch</h2>
                        <div className="text-sm space-y-2 text-gray-400">
                            <p>+237 6XX XXX XXX</p>
                            <p>contact@quicklearn.cm</p>
                            <p>Douala, Littoral, Cameroon</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5 text-gray-500">
                Copyright {new Date().getFullYear()} © QuickLearn Cameroon. All Rights Reserved.
            </p>
        </footer>
  )
}   
export default Footer
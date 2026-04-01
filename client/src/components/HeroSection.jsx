import React from "react"
import { ArrowRight, BookOpen, Brain, PlayCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

const HeroSection = () => {

    const navigate = useNavigate()

  return (
    <div className="flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 bg-gray-950 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center h-[90vh] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent"></div>

        <div className="relative z-10 w-full max-w-3xl mt-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Brain size={18} />
                <span>AI-Powered Revision Engine v2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Master Any Topic, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">At Your Own Pace.</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6 font-medium">
                <div className="flex items-center gap-1"><BookOpen className="w-5 h-5"/> Flashcards</div>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <div className="flex items-center gap-1"><PlayCircle className="w-5 h-5"/> Video Lessons</div>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <div className="flex items-center gap-1"><Brain className="w-5 h-5"/> Contextual AI Tutor</div>
            </div>

            <p className="max-w-xl text-lg text-gray-300 mb-10 leading-relaxed">
                Transform the way you study. Dive into curated educational topics featuring multi-part video lessons, interactive flashcards, and a dedicated AI tutor that understands exactly what you are trying to learn.
            </p>

            <div className="flex items-center gap-4">
                <button onClick={()=> navigate('/topics')} className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 transition-colors text-white rounded-full font-bold shadow-lg shadow-blue-500/30">
                    Browse Topics <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  )
}

export default HeroSection

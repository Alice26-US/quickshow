import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Video } from "lucide-react";

const TopicCard = ({ topic }) => {
    const studentField = topic.field || "Engineering";
    
    // Fallback image if we wanted cover images eventually. Using elegant gradient for now.
    const bgGradients = [
        "from-blue-600 to-indigo-800",
        "from-emerald-600 to-teal-800",
        "from-purple-600 to-fuchsia-800",
        "from-amber-500 to-orange-700",
        "from-sky-500 to-blue-700"
    ];
    // Create deterministic color based on title length
    const gradient = bgGradients[topic.title.length % bgGradients.length];

    return (
        <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-300 group shadow-lg">
            {/* Mock Thumbnail */}
            <Link to={`/topics/${topic._id}`} className={`h-40 w-full bg-gradient-to-br ${gradient} p-6 flex flex-col justify-end relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="relative z-10">
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/10 uppercase tracking-wider">
                            {topic.level}
                        </span>
                        <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/10">
                            {studentField === "Medical" ? "Medical / Health" : "Engineering"}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-200 transition-colors">{topic.title}</h3>
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                    {topic.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Video size={14} className="text-blue-400"/>
                            {topic.videos?.length || 0} Lessons
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <BookOpen size={14} className="text-purple-400"/>
                            {topic.flashcards?.length || 0} Cards
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicCard;

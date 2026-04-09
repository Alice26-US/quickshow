import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import TopicCard from "./TopicCard";

const FeaturedSection = () => {
    const [topics, setTopics] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    useEffect(() => {
        const fetchRecentTopics = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/topics/list`);
                if (data.success) {
                    // Grab only the latest 3 for the home page feature
                    setTopics(data.topics.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch featured topics", error);
            }
        };
        fetchRecentTopics();
    }, [API_URL]);

    return (
        <div className="py-24 px-6 md:px-16 lg:px-36 bg-gray-950 text-white relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wider text-sm uppercase mb-3">
                        <Sparkles size={16} /> Latest Curriculums
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Jump Into Specialized Topics</h2>
                    <p className="text-gray-400 text-lg">Our AI-assisted curriculum offers comprehensive breakdowns of the most demanding subjects. Start a revision session today.</p>
                </div>
                
                <Link to="/topics" className="group flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-6 py-3 rounded-full hover:border-gray-600">
                    View Entire Catalog
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topics.map(topic => (
                    <TopicCard key={topic._id} topic={topic} />
                ))}
            </div>
            
            {topics.length === 0 && (
                <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                    No active topics published. Check back later or login as Admin to deploy topics.
                </div>
            )}
        </div>
    );
};

export default FeaturedSection;

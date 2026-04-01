import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TopicCard from "../components/TopicCard";
import { Search } from "lucide-react";

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/topics/list");
        if (data.success) {
          setTopics(data.topics);
        } else {
          toast.error("Failed to load topics");
        }
      } catch (error) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-gray-950 min-h-screen pt-32 pb-20 px-6 md:px-16 lg:px-36 text-white font-sans">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
            <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">Topic Catalog</h1>
                <p className="text-gray-400 text-lg">Browse our expanding library of robust educational resources.</p>
            </div>
            
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by topic title..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-full pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-gray-500 shadow-inner"
                />
            </div>
        </div>

      {loading ? (
          <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
      ) : (
          <>
            {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTopics.map((topic) => (
                        <TopicCard key={topic._id} topic={topic} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-900 border border-dashed border-gray-800 rounded-3xl">
                    <Search className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No topics found</h3>
                    <p className="text-gray-500">We couldn't find any topics matching your search.</p>
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default Topics;

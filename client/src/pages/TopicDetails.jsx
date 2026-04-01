import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/topics/${id}`);
        if (data.success) {
          setTopic(data.topic);
        } else {
          toast.error("Failed to load topic details");
        }
      } catch (error) {
        toast.error("Error connected to server");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  const startRevision = async () => {
    if (!userId) {
      toast.error("You must be signed in to start a revision.");
      return;
    }
    
    try {
        const { data } = await axios.post("http://localhost:3000/api/sessions/start", {
            userId,
            topicId: id
        });
        
        if(data.success) {
            toast.success("Revision session started!");
            navigate(`/session/${data.session._id}`);
        } else {
            toast.error("Failed to start session.");
        }
    } catch(err) {
        toast.error("Could not start session.");
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
  if (!topic) return <div className="text-center py-20 text-white">Topic not found</div>;

  return (
    <div className="container mx-auto px-4 py-20 pt-32 text-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6">{topic.title}</h1>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">{topic.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Videos Available</h3>
            <p className="text-3xl text-purple-400">{topic.videos?.length || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Flashcards Included</h3>
            <p className="text-3xl text-blue-400">{topic.flashcards?.length || 0}</p>
          </div>
        </div>

        <button 
            onClick={startRevision}
            className="w-full py-4 text-xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
        >
          Start Revision Session
        </button>
      </div>
    </div>
  );
};

export default TopicDetails;

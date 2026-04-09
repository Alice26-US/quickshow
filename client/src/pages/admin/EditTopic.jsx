import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

const EditTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    field: "Engineering",
  });

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/topics/${id}`);
        if (!data.success || !data.topic) {
          toast.error("Topic not found");
          navigate("/admin/list-topics");
          return;
        }

        const topic = data.topic;
        setFormData({
          title: topic.title || "",
          description: topic.description || "",
          level: topic.level || "Beginner",
          field: topic.field || "Engineering",
        });
        setCurrentThumbnail(topic.thumbnail || "");
      } catch (error) {
        toast.error("Failed to load topic");
        navigate("/admin/list-topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [API_URL, id, navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("level", formData.level);
      payload.append("field", formData.field);
      if (thumbnailFile) payload.append("thumbnail", thumbnailFile);

      const { data } = await axios.put(`${API_URL}/topics/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.success) {
        toast.error(data.message || "Failed to update topic");
        return;
      }

      toast.success("Topic updated successfully.");
      navigate("/admin/list-topics");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update topic");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-300">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading topic...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
      <button
        type="button"
        onClick={() => navigate("/admin/list-topics")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to topics
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-white mb-2">Edit Topic</h1>
        <p className="text-gray-400 mb-8">Update topic details and classification.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Course Title</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Proficiency</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Student Field</label>
              <select
                name="field"
                value={formData.field}
                onChange={handleInputChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical / Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Thumbnail (optional)</label>
            {(thumbnailFile || currentThumbnail) && (
              <img
                src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : currentThumbnail}
                alt="Topic thumbnail"
                className="w-full max-w-sm h-40 object-cover rounded-lg border border-gray-800 mb-3"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/list-topics")}
              disabled={saving}
              className="px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTopic;

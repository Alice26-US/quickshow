import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle, XCircle } from "lucide-react";

const AddTopic = () => {
  const [formData, setFormData] = useState({ title: "", description: "", level: "Beginner" });
  const [videoFiles, setVideoFiles] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVideoDragOver = (e) => e.preventDefault();
  const handleVideoDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) setVideoFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return toast.error("Please fill mandatory fields.");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("level", formData.level);
    
    Array.from(videoFiles).forEach((file) => data.append("videos", file));
    if (csvFile) data.append("csvFile", csvFile);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post("http://localhost:3000/api/topics/add", data, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
          }
      });
      
      if (response.data.success) {
        toast.success("Course material successfully deployed.");
        setFormData({ title: "", description: "", level: "Beginner" });
        setVideoFiles([]);
        setCsvFile(null);
        if(videoInputRef.current) videoInputRef.current.value = '';
        if(csvInputRef.current) csvInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Deployment failed.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Topic</h1>
        <p className="text-gray-400">Deploy a new educational course package including videos and flashcards.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Metadata */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Course Info</h3>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Course Title *</label>
                        <input required name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="e.g. Advanced System Architecture" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-gray-600" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Detailed Description *</label>
                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Briefly describe what this module covers..." className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-gray-600 resize-none"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Target Proficiency</label>
                        <select name="level" value={formData.level} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white appearance-none">
                            <option value="Beginner">Beginner Level</option>
                            <option value="Intermediate">Intermediate Level</option>
                            <option value="Advanced">Advanced Level</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Video Upload Area */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-sm">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                     <h3 className="text-lg font-semibold text-white">Media Assets</h3>
                     <span className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{videoFiles.length} local files queued</span>
                 </div>
                 
                 <div 
                    onDragOver={handleVideoDragOver} 
                    onDrop={handleVideoDrop}
                    className="border-2 border-dashed border-gray-700 bg-gray-950 hover:bg-gray-800/30 hover:border-blue-500/50 transition-all rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => videoInputRef.current.click()}
                 >
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Click to browse or drag & drop videos here</p>
                    <p className="text-xs text-gray-500">MP4, WEBM up to 2GB each</p>
                    <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={(e) => setVideoFiles(Array.from(e.target.files))} className="hidden" />
                 </div>
                 
                 {videoFiles.length > 0 && (
                     <div className="mt-4 grid grid-cols-2 gap-3">
                         {videoFiles.map((f, i) => (
                             <div key={i} className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-800">
                                 <CheckCircle className="text-blue-500 shrink-0" size={16} />
                                 <span className="text-sm text-gray-300 truncate w-full">{f.name}</span>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>

        {/* Right Column - Flashcards & Submit */}
        <div className="space-y-6">
             <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Knowledge Base</h3>
                
                <div 
                    className="border-2 border-dashed border-gray-700 bg-gray-950 hover:bg-gray-800/30 hover:border-emerald-500/50 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group mb-4"
                    onClick={() => csvInputRef.current.click()}
                 >
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet size={24} />
                    </div>
                    <p className="text-sm font-medium text-white text-center mb-1">Upload CSV Flashcards</p>
                    <input ref={csvInputRef} type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="hidden" />
                </div>
                {csvFile ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm border border-emerald-500/20">
                        <span className="truncate max-w-[80%]">{csvFile.name}</span>
                        <XCircle size={16} className="cursor-pointer hover:text-emerald-300" onClick={() => { setCsvFile(null); csvInputRef.current.value=''; }} />
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 text-center">Headers recognized: Front, Back, Question, Answer</p>
                )}
             </div>

             <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-8 rounded-2xl shadow-sm">
                 <h3 className="text-lg font-semibold text-white mb-4">Deploy Package</h3>
                 <p className="text-sm text-gray-300 mb-6">Review your assets carefully. This topic will immediately be available to students upon deployment.</p>
                 
                 <button 
                    disabled={isUploading}
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 outline-none hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? <><Loader2 size={18} className="animate-spin" /> {uploadProgress}% Uploading...</> : 'Deploy Course Material'}
                 </button>
             </div>
        </div>
      </form>
    </div>
  );
};

export default AddTopic;

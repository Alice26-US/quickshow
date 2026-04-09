import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Search, Save } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "rejected", label: "Rejected" },
];

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const ContentRequests = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const [requests, setRequests] = useState([]);
  const [edits, setEdits] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const hydrateEdits = (requestList) => {
    const initial = {};
    requestList.forEach((request) => {
      initial[request._id] = {
        status: request.status || "pending",
        adminFeedback: request.adminFeedback || "",
        availableAt: toDateInputValue(request.availableAt),
        videoLink: request.videoLink || "",
      };
    });
    setEdits(initial);
  };

  const fetchRequests = async () => {
    try {
      const headers = getAuthHeaders();
      const { data } = await axios.get(`${API_URL}/requests/admin`, { headers });
      if (data.success) {
        setRequests(data.requests);
        hydrateEdits(data.requests);
      } else {
        toast.error(data.message || "Failed to fetch content requests.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch content requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [API_URL]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) =>
        `${request.studentName} ${request.studentEmail} ${request.topic} ${request.requestType}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [requests, searchQuery]
  );

  const updateEdit = (requestId, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [key]: value,
      },
    }));
  };

  const saveRequestUpdate = async (requestId) => {
    const draft = edits[requestId];
    if (!draft) return;

    try {
      setSavingId(requestId);
      const headers = getAuthHeaders();
      const { data } = await axios.put(`${API_URL}/requests/admin/${requestId}`, draft, { headers });
      if (data.success) {
        toast.success("Feedback saved.");
        setRequests((prev) =>
          prev.map((request) => (request._id === requestId ? data.request : request))
        );
        updateEdit(requestId, "availableAt", toDateInputValue(data.request.availableAt));
      } else {
        toast.error(data.message || "Could not save feedback.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save feedback.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-950 text-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Content Requests</h1>
        <p className="text-gray-400">Respond to student requests for new videos and flashcards.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student or topic..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No content requests found.</div>
        ) : (
          <div className="p-5 space-y-4">
            {filteredRequests.map((request) => {
              const draft = edits[request._id] || {
                status: "pending",
                adminFeedback: "",
                availableAt: "",
                videoLink: "",
              };

              return (
                <div key={request._id} className="border border-gray-800 rounded-xl p-4 bg-gray-950/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-white">
                        {request.studentName || "Student"} - {request.topic}
                      </p>
                      <p className="text-xs text-gray-400">
                        {request.studentEmail} - {request.requestType.toUpperCase()} - {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <select
                      value={draft.status}
                      onChange={(e) => updateEdit(request._id, "status", e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-sm text-gray-300 mb-4">{request.message}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
                    <div className="lg:col-span-2">
                      <label className="text-xs text-gray-400 block mb-1">Admin Feedback</label>
                      <textarea
                        rows={3}
                        value={draft.adminFeedback}
                        onChange={(e) => updateEdit(request._id, "adminFeedback", e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Write response to student..."
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Availability Date</label>
                        <input
                          type="date"
                          value={draft.availableAt}
                          onChange={(e) => updateEdit(request._id, "availableAt", e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Video Link (Optional)</label>
                        <input
                          value={draft.videoLink}
                          onChange={(e) => updateEdit(request._id, "videoLink", e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => saveRequestUpdate(request._id)}
                      disabled={savingId === request._id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white text-sm font-semibold transition-colors"
                    >
                      {savingId === request._id ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      Save Feedback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentRequests;

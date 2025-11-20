import React, { useEffect, useState } from "react";

export default function UserComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:8080/user/complaint", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch complaints");

      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async () => {
    try {
      const res = await fetch("http://localhost:8080/user/complaint", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit complaint");

      alert("Complaint submitted successfully!");

      // Refresh list
      fetchComplaints();

      // Reset form
      setSubject("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) return <p className="text-gray-600">Loading complaints...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">Your Complaints</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + Add
        </button>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <p className="text-gray-600">You have not submitted any complaints yet.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg shadow-md bg-gradient-to-r from-yellow-50 to-orange-50"
            >
              <h3 className="font-bold text-lg text-gray-800">{c.subject}</h3>
              <p className="text-gray-700 mt-1">{c.description}</p>

              <p className="text-xs text-gray-500 mt-2">
                Submitted on: {new Date(c.createdAt).toLocaleString("en-IN")}
              </p>

              <p className="text-xs text-blue-600 font-semibold mt-1">
                Status: {c.status ? c.status : "pending"}
              </p>

              {c.adminNotes && (
                <p className="text-sm text-green-700 mt-2">
                  Admin Note: {c.adminNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Submit New Complaint</h3>

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            />

            {/* Description */}
            <textarea
              placeholder="Describe your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows="4"
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitComplaint}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

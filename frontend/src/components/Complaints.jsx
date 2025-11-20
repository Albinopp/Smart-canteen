import React, { useEffect, useState } from "react";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const token = localStorage.getItem("token");

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/complaint", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to load complaints");

      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Update complaint with admin note
  const updateComplaint = async () => {
    if (!selectedComplaint) return;

    // Prevent empty note
    if (!adminNotes.trim()) {
      alert("Admin note cannot be empty!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/complaint/edit/${selectedComplaint.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminNotes,
            status: "acknowledged",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update complaint");

      alert("Complaint updated successfully!");
      fetchComplaints();
      setShowModal(false);
      setSelectedComplaint(null);
      setAdminNotes("");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <p className="text-gray-600">Loading complaints...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Customer Complaints
      </h2>

      {complaints.length === 0 ? (
        <p className="text-gray-500">No complaints available.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg shadow-md bg-gradient-to-r from-yellow-50 to-orange-50"
            >
              <h3 className="font-bold text-lg text-gray-800">
                {comp.subject}
              </h3>

              <p className="text-gray-700 mt-1">{comp.description}</p>

              <p className="text-xs text-gray-500 mt-2">
                Submitted by: {comp.userName}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Date: {new Date(comp.createdAt).toLocaleString("en-IN")}
              </p>

              <p className="text-xs mt-1 font-semibold text-blue-600">
                Status:{" "}
                {comp.status && comp.status !== "" ? comp.status : "pending"}
              </p>

              {/* Show admin note if exists */}
              {comp.adminNotes && (
                <p className="text-sm text-green-700 mt-2">
                  Admin Note: {comp.adminNotes}
                </p>
              )}

              {/* Add/Edit button */}
              <button
                onClick={() => {
                  setSelectedComplaint(comp);
                  setAdminNotes(comp.adminNotes || "");
                  setShowModal(true);
                }}
                className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                {comp.adminNotes ? "Edit Admin Note" : "Add Admin Note"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center bg-black/20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">
              {selectedComplaint.adminNotes ? "Edit Admin Note" : "Add Admin Note"} —{" "}
              {selectedComplaint.subject}
            </h3>

            <textarea
              rows="4"
              className="w-full border rounded p-2 mb-4"
              placeholder="Admin notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAdminNotes("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={updateComplaint}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

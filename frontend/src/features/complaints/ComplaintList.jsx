import { useEffect, useState } from "react";
import axios from "axios";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      const res = await axios.get(
        "http://localhost:8000/api/v1/complaints/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComplaints(res.data);
    };

    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cfe3df] to-[#d9e3ea] p-10">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        My Complaints
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {complaints.map((c) => (
          <div
            key={c._id}
            className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow"
          >
            <h2 className="text-lg font-bold mb-2">{c.title}</h2>

            <p className="text-gray-600 mb-2">{c.description}</p>

            <div className="text-sm text-gray-500">
              Priority: {c.priority}
            </div>

            <div className="text-sm text-gray-500">
              Status: {c.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

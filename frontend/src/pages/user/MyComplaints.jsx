import { useEffect, useState } from "react";
import API from "../../api/axios";
import UserLayout from "../../layouts/UserLayout";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaints/my");
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <UserLayout>
      <div>
        <h2 className="text-2xl font-bold mb-6">My Complaints</h2>

        <div className="grid gap-4">

          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded shadow"
            >
              <h3 className="text-lg font-semibold">{c.title}</h3>

              <p className="text-gray-600">{c.description}</p>

              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>Priority: {c.priority}</span>
                <span>Deadline: {new Date(c.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </UserLayout>
  );
};

export default MyComplaints;
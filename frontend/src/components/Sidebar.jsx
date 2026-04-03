import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-gray-900 text-white p-5 space-y-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <button
        className="block w-full text-left hover:bg-gray-700 p-2 rounded"
        onClick={() => navigate("/create-complaint")}
      >
        Create Complaint
      </button>

      <button
        className="block w-full text-left hover:bg-gray-700 p-2 rounded"
        onClick={() => navigate("/my-complaints")}
      >
        My Complaints
      </button>
    </div>
  );
};

export default Sidebar;
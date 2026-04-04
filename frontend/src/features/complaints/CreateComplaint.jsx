import { useState } from "react";
import { createComplaint } from "./complaintApi";

export default function CreateComplaint() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department_id: "",
    priority: "MEDIUM",
    file: null,
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await createComplaint(formData, token);
      alert("Complaint submitted 🚀");
    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cfe3df] to-[#d9e3ea] flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-xl">

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Raise Complaint
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="p-3 rounded-xl border"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="p-3 rounded-xl border"
            required
          />

          <input
            name="department_id"
            placeholder="Department ID"
            onChange={handleChange}
            className="p-3 rounded-xl border"
            required
          />

          <select
            name="priority"
            onChange={handleChange}
            className="p-3 rounded-xl border"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <input type="file" name="file" onChange={handleChange} />

          <button
            type="submit"
            className="bg-[#1e6f5c] text-white p-3 rounded-xl font-medium"
          >
            Submit Complaint
          </button>

        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import API from "../../api/axios";
import UserLayout from "../../layouts/UserLayout";
import Input from "../../components/Input";
import Button from "../../components/Button";

const CreateComplaint = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department_id: "",
    priority: "MEDIUM",
    file: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await API.post("/complaints/create", formData);
      alert("Complaint created ✅");
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  return (
    <UserLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create Complaint</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            name="title"
            placeholder="Title"
            onChange={handleChange}
          />

          <textarea
            className="border p-2 w-full rounded"
            name="description"
            placeholder="Description"
            onChange={handleChange}
          />

          <Input
            name="department_id"
            placeholder="Department ID"
            onChange={handleChange}
          />

          <select
            className="border p-2 w-full rounded"
            name="priority"
            onChange={handleChange}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <input type="file" onChange={handleFileChange} />

          <Button type="submit">Submit Complaint</Button>

        </form>
      </div>
    </UserLayout>
  );
};

export default CreateComplaint;
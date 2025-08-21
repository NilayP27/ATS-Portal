import React, { useState, useEffect } from "react";
import "./ProfileEdit.css";  // we’ll create this CSS file too

const ProfileEdit = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
  });

  // ✅ Load user details (either from localStorage or API)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    setFormData({
      fullName: storedUser.fullName || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
      department: storedUser.department || "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      alert("Profile updated successfully!");

      // Save updated info
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };

  return (
    <div className="profileEditContainer">
      <h2>Edit Personal Information</h2>
      <form className="profileForm" onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </label>

        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>
          Phone:
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </label>

        {/* <label>
          Department:
          <input type="text" name="department" value={formData.department} onChange={handleChange} />
        </label> */}

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfileEdit;

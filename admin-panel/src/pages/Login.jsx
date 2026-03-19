import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.user.role !== "admin") {
        alert("Not authorized as admin");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <h1>Admin Portal</h1>
          <p>Login to continue your journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>
      </div>
    </div>
  );
}
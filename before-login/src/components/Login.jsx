import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store auth info
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      navigate("/"); // later you can route based on role
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-auth-wrapper">
      <div className="tm-auth-card">
        {/* Header */}
        <div className="tm-auth-header">
          <h2>Telemedicine Portal</h2>
          <p>Login to continue your journey</p>
        </div>

        {/* Step Indicator */}
        <div className="tm-auth-steps">
          <div className="step active">
            <span>1</span>
            <p>Login</p>
          </div>
          <div className="line" />
          <div className="step">
            <span>2</span>
            <p>Dashboard</p>
          </div>
        </div>

        {/* Form */}
        <form className="tm-auth-form" onSubmit={handleSubmit}>
          {error && <div className="tm-error">{error}</div>}

          <div className="tm-form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tm-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="tm-primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="tm-auth-footer">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

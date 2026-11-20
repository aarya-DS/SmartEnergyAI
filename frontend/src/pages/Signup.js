import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [fullName, setFullName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      navigate("/login");
    } catch (err) {
      setError(err.message.includes("Failed to fetch")
        ? "Cannot reach the server. Please start the backend."
        : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div>
          <div className="auth-logo">
            <div className="auth-logo-icon">⚡</div>
            Energy Intelligence
          </div>
          <h2 className="auth-headline">
            Join thousands of<br/>smart buildings.
          </h2>
          <p className="auth-subline">
            Start forecasting energy demand and maximising your solar investment today.
          </p>

          <div className="auth-features">
            {["Free to get started", "No hardware required", "Dataset buildings included", "Real ML predictions"].map(f => (
              <div className="auth-feature-item" key={f}>
                <div className="auth-feature-check">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          AI Renewable Energy Optimization Platform
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-title">Create account</div>
          <div className="auth-card-sub">Start your energy intelligence journey</div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠ {error}
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Full name</label>
            <input type="text" className="auth-input" placeholder="Alex Johnson"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email address</label>
            <input type="email" className="auth-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input type="password" className="auth-input" placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Confirm password</label>
            <input type="password" className="auth-input" placeholder="Repeat password"
              value={confirmPassword} onChange={e => setConfirm(e.target.value)} required />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner"></span> Creating account…</> : "Create Account →"}
          </button>

          <div className="auth-footer">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")}>Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;

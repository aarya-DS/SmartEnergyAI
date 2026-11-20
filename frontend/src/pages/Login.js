import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }   = useContext(AuthContext);
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      login(data.token, data.user);
      navigate("/dashboard");
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
            Monitor. Forecast.<br/>Optimise.
          </h2>
          <p className="auth-subline">
            AI-powered demand forecasting and renewable energy allocation for smart buildings.
          </p>

          <div className="auth-features">
            {["AI demand forecasting", "Solar allocation engine", "Grid dependency tracking", "Multi-building support"].map(f => (
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
          <div className="auth-card-title">Welcome back</div>
          <div className="auth-card-sub">Sign in to your Energy Intelligence account</div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠ {error}
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email address</label>
            <input
              type="email" className="auth-input"
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input
              type="password" className="auth-input"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner"></span> Signing in…</> : "Sign In →"}
          </button>

          <div className="auth-footer">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/signup")}>Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: "🤖", title: "AI Demand Forecast", desc: "Three ML models compete; the best wins automatically." },
    { icon: "☀️", title: "Solar Allocation",    desc: "Maximise renewable use before drawing from the grid." },
    { icon: "📊", title: "Live Analytics",      desc: "See exactly where every kWh comes from and goes." },
    { icon: "🏢", title: "Multi-Building",      desc: "Manage any number of buildings from one dashboard." },
  ];

  return (
    <div className="landing-root">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">⚡</div>
          Energy Intelligence
        </div>
        <div className="landing-nav-links">
          <button className="landing-link-ghost" onClick={() => navigate("/login")}>Log In</button>
          <button className="landing-btn-cta" onClick={() => navigate("/signup")}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-badge">
          <span>✦</span> AI-Powered Energy Platform
        </div>
        <h1 className="landing-h1">
          Smart energy for<br /><span>smarter buildings</span>
        </h1>
        <p className="landing-sub">
          Forecast electricity demand, allocate solar intelligently and minimise
          grid dependency — all in one clean dashboard.
        </p>
        <div className="landing-actions">
          <button className="landing-btn-primary" onClick={() => navigate("/signup")}>
            Start Optimising →
          </button>
          <button className="landing-btn-outline" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>

        {/* Features strip */}
        <div className="landing-features">
          {features.map(f => (
            <div className="landing-feature" key={f.title}>
              <div className="landing-feature-icon">{f.icon}</div>
              <div>
                <div className="landing-feature-title">{f.title}</div>
                <div className="landing-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;

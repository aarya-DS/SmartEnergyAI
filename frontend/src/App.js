import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import EnergyAnalysis from "./pages/EnergyAnalysis";
import MyBuildings from "./pages/MyBuildings";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import "./App.css";

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

const NAV_ITEMS = [
  { name: "Dashboard",       path: "/dashboard", icon: "⊞" },
  { name: "My Buildings",    path: "/buildings",  icon: "🏢" },
  { name: "Energy Analysis", path: "/analysis",   icon: "⚡" },
  { name: "Analytics",       path: "/analytics",  icon: "📊" },
];

function AppLayout({ children, pageTitle }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [backendOnline, setBackendOnline] = React.useState(null);

  React.useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(r => r.json())
      .then(d => setBackendOnline(d.status === "ok"))
      .catch(() => setBackendOnline(false));
    const id = setInterval(() => {
      fetch("http://127.0.0.1:8000/health")
        .then(r => r.json())
        .then(d => setBackendOnline(d.status === "ok"))
        .catch(() => setBackendOnline(false));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const initials = (user?.full_name || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const statusClass = backendOnline === null ? "checking" : backendOnline ? "online" : "offline";
  const statusText  = backendOnline === null ? "Checking…" : backendOnline ? "AI Engine Online" : "Backend Offline";

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <div className="sidebar-logo-text">Energy Intelligence</div>
            <div className="sidebar-logo-sub">Smart Building Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item${location.pathname === item.path ? " active" : ""}`}
            >
              <em className="nav-icon">{item.icon}</em>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{user?.full_name || "User"}</div>
              <div className="sidebar-user-role">Building Manager</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            <span>↩</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{pageTitle || NAV_ITEMS.find(n => n.path === location.pathname)?.name || "Dashboard"}</span>
          <div className="topbar-status">
            <span className={`status-dot ${statusClass}`}></span>
            {statusText}
          </div>
        </header>

        <div className="page-body">
          {backendOnline === false && (
            <div className="alert-offline">
              ⚠️ <strong>AI service is unavailable.</strong> Start the FastAPI server on port 8000 to enable predictions.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/buildings" element={<ProtectedRoute><AppLayout><MyBuildings /></AppLayout></ProtectedRoute>} />
          <Route path="/analysis"  element={<ProtectedRoute><AppLayout><EnergyAnalysis /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

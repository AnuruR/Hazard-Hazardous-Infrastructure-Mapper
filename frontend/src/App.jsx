import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import HazardMap from "./components/HazardMap";
import Login from "./components/login";

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("hazard_token");
    if (!token) return;
    axios.get("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setSession({ token, user: data.user });
        setShowMap(true);
      })
      .catch(() => localStorage.removeItem("hazard_token"));
  }, []);

  const handleAuthenticated = ({ token, user }) => {
    localStorage.setItem("hazard_token", token);
    setSession({ token, user });
    setShowMap(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("hazard_token");
    setSession(null);
  };

  return (
    <main className={showMap ? "app-page app-page--map" : "app-page"}>
      {!showMap && (
        <section className="access-card" aria-label="Emergency access or sign in">
          <div className="danger-action">
            <p className="danger-prompt">Need help right now?</p>
            <p className="danger-caption">Open the hazard map without signing in.</p>
            <button
              type="button"
              className="hazard-button"
              onClick={() => setShowMap(true)}
            >
              I&apos;m in danger
            </button>
          </div>
          <div className="access-divider"><span>or sign in</span></div>
          <Login onAuthenticated={handleAuthenticated} />
        </section>
      )}
      {showMap && <HazardMap session={session} onAuthenticated={handleAuthenticated} onLogout={handleLogout} />}
    </main>
  );
}

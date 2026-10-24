import { useState } from "react";
import "./App.css";
import HazardMap from "./components/HazardMap";
import Login from "./components/login";

export default function App() {
  const [showMap, setShowMap] = useState(false);

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
          <Login />
        </section>
      )}
      {showMap && <HazardMap />}
    </main>
  );
}

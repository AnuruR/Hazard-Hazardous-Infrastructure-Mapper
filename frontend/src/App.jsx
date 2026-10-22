import { useState } from "react";
import "./App.css";
import HazardMap from "./components/HazardMap";

export default function App() {
  const [showMap, setShowMap] = useState(false);

  return (
    <main className={showMap ? "app-page app-page--map" : "app-page"}>
      {!showMap && (
        <button
          type="button"
          className="hazard-button"
          onClick={() => setShowMap(true)}
        >
          Open Hazard Map
        </button>
      )}
      {showMap && <HazardMap />}
    </main>
  );
}

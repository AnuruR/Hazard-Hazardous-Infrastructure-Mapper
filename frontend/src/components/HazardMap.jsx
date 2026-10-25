import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useEffect, useState } from "react";
import Login from "./login";
import ReportDanger from "./ReportDanger";

function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== "" && longitude !== "") {
      map.setView([Number(latitude), Number(longitude)], map.getZoom());
    }
  }, [longitude, latitude, map]);
  return null;
}

export default function HazardMap({ session, onAuthenticated, onLogout }) {
  const [latitude, setLatitude] = useState(6.9271);
  const [longitude, setLongitude] = useState(79.8612);
  const [authMode, setAuthMode] = useState(null);
  const markers = [
    {
      geocode: [Number(latitude), Number(longitude)],
      popUp: "Marker 1",
    },
  ];

  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5591/5591266.png",
    iconSize: [38, 38],
  });

  return (
    <div className="hazard-map">
      <header className="map-toolbar">
        <div className="coordinate-panel" aria-label="Set map coordinates">
          <div className="coordinate-heading">
            <span className="coordinate-kicker">MAP LOCATION</span>
            <span className="coordinate-title">Jump to coordinates</span>
          </div>
          <label className="coordinate-field">
            <span>Latitude</span>
            <input
              className="hazard-map_latitude"
              type="number"
              min="-90"
              max="90"
              step="any"
              placeholder="6.9271"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </label>
          <label className="coordinate-field">
            <span>Longitude</span>
            <input
              className="hazard-map_longitude"
              type="number"
              min="-180"
              max="180"
              step="any"
              placeholder="79.8612"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>
        </div>
        <nav className="map-auth-actions" aria-label="Account actions">
          <div className="map-auth-buttons">
            {session ? (
              <>
                <span className="map-signed-in">
                  Signed in as <strong>{session.user.username}</strong>
                </span>
                <button
                  type="button"
                  className="map-auth-button map-auth-button--login"
                  onClick={onLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="map-auth-button map-auth-button--login"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="map-auth-button map-auth-button--register"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </>
            )}
          </div>
          <div className="map-report-action">
            <ReportDanger
              location={{
                latitude: Number(latitude),
                longitude: Number(longitude),
              }}
            />
          </div>
        </nav>
      </header>
      {authMode && (
        <div className="map-auth-backdrop" onClick={() => setAuthMode(null)}>
          <section
            className="map-auth-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="map-auth-close"
              type="button"
              aria-label="Close"
              onClick={() => setAuthMode(null)}
            >
              ×
            </button>
            <Login
              initialMode={authMode}
              onAuthenticated={(data) => {
                onAuthenticated(data);
                setAuthMode(null);
              }}
            />
          </section>
        </div>
      )}
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={13}
        className="hazard-map_container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater latitude={latitude} longitude={longitude} />

        {markers.map((marker) => (
          <Marker
            key={marker.geocode.join(",")}
            position={marker.geocode}
            icon={customIcon}
          >
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-report-action map-report-action--bottom">
        <ReportDanger
          location={{
            latitude: Number(latitude),
            longitude: Number(longitude),
          }}
        />
      </div>
    </div>
  );
}

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
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

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

const NOMINATIM_URL = window.__HAZARD_NOMINATIM_URL__ ||
  import.meta.env.VITE_NOMINATIM_URL ||
  "https://nominatim.openstreetmap.org/reverse";

function isValidCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return latitude !== "" && longitude !== "" && Number.isFinite(lat) &&
    Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function getLocationDetails(address) {
  const details = {};
  for (const field of ["city", "town", "postcode", "village", "municipality", "hamlet", "locality", "suburb"]) {
    if (typeof address?.[field] === "string" && address[field].trim()) {
      details[field] = address[field].trim();
    }
  }
  return details;
}

function getLocationName(details) {
  const cityAndTown = [details.city, details.town].filter((name, index, all) =>
    name && all.findIndex((candidate) => candidate.toLocaleLowerCase() === name.toLocaleLowerCase()) === index
  );
  if (cityAndTown.length) return cityAndTown.join(", ");

  for (const field of ["village", "municipality", "hamlet", "locality", "suburb"]) {
    if (details[field]) return details[field];
  }
  return "";
}

export default function HazardMap({ session, onAuthenticated, onLogout }) {
  const [latitude, setLatitude] = useState(6.9271);
  const [longitude, setLongitude] = useState(79.8612);
  const [authMode, setAuthMode] = useState(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [reportError, setReportError] = useState("");
  const [locationDetails, setLocationDetails] = useState({});
  const [locationLookupStatus, setLocationLookupStatus] = useState("idle");
  const [reportCoordinates, setReportCoordinates] = useState(null);
  const reportRequestInProgress = useRef(false);
  const lookupTimer = useRef(null);
  const lookupController = useRef(null);
  const lookupId = useRef(0);
  const locationCache = useRef(new Map());

  const selectCoordinates = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationDetails({});
    setLocationLookupStatus("idle");
    lookupId.current += 1;
    clearTimeout(lookupTimer.current);
    lookupController.current?.abort();
    lookupController.current = null;

    if (!isValidCoordinates(lat, lng)) return;

    const latitudeValue = Number(lat);
    const longitudeValue = Number(lng);
    const coordinateKey = `${latitudeValue},${longitudeValue}`;
    if (locationCache.current.has(coordinateKey)) {
      const cached = locationCache.current.get(coordinateKey);
      setLocationDetails(cached);
      setLocationLookupStatus(getLocationName(cached) ? "success" : "unavailable");
      return;
    }

    setLocationLookupStatus("loading");
    const currentLookupId = lookupId.current;
    lookupTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      lookupController.current = controller;
      try {
        const url = new URL(NOMINATIM_URL);
        url.search = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          lat: String(latitudeValue),
          lon: String(longitudeValue),
        }).toString();
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Location lookup failed (${response.status}).`);
        const result = await response.json();
        if (!result || typeof result !== "object" || Array.isArray(result)) {
          throw new Error("Location lookup returned an invalid response.");
        }

        const address = result.address && typeof result.address === "object" && !Array.isArray(result.address)
          ? result.address
          : {};
        const resolvedLocationDetails = getLocationDetails(address);
        if (currentLookupId !== lookupId.current) return;
        locationCache.current.set(coordinateKey, resolvedLocationDetails);
        setLocationDetails(resolvedLocationDetails);
        setLocationLookupStatus(getLocationName(resolvedLocationDetails) ? "success" : "unavailable");
      } catch (error) {
        if (error?.name === "AbortError" || currentLookupId !== lookupId.current) return;
        locationCache.current.set(coordinateKey, {});
        setLocationDetails({});
        setLocationLookupStatus("unavailable");
      } finally {
        if (currentLookupId === lookupId.current) lookupController.current = null;
      }
    }, 1000);
  };

  useEffect(() => () => {
    clearTimeout(lookupTimer.current);
    lookupController.current?.abort();
  }, []);

  const startReport = async () => {
    if (reportRequestInProgress.current) return;
    const selectedLatitude = Number(latitude);
    const selectedLongitude = Number(longitude);
    if (
      latitude === "" ||
      longitude === "" ||
      !Number.isFinite(selectedLatitude) ||
      !Number.isFinite(selectedLongitude) ||
      selectedLatitude < -90 ||
      selectedLatitude > 90 ||
      selectedLongitude < -180 ||
      selectedLongitude > 180
    ) {
      setReportError("Enter valid latitude and longitude before reporting.");
      return;
    }

    const selectedCoordinates = `${selectedLatitude},${selectedLongitude}`;
    setReportCoordinates(selectedCoordinates);
    reportRequestInProgress.current = true;
    setIsCreatingReport(true);
    setReportError("");
    try {
      const response = await axios.post("http://localhost:5000/api/report", {
        latitude: selectedLatitude,
        longitude: selectedLongitude,
      });
      const createdReportId = response.data?.report?._id;
      if (!createdReportId) {
        throw new Error("The server did not return the saved report ID.");
      }
      setReportId(createdReportId);
      setIsReportFormOpen(true);
    } catch (error) {
      console.error("Initial report creation failed:", error);
      setReportError(
        error.response?.data?.message ||
          error.message ||
          "Could not save the location report. Please try again."
      );
    } finally {
      reportRequestInProgress.current = false;
      setIsCreatingReport(false);
    }
  };
  const markers = [
    {
      geocode: [Number(latitude), Number(longitude)],
      popUp: `Latitude: ${latitude.toPrecision(3)}, Longitude: ${longitude.toPrecision(3)}`,
    },
  ];

  const customIcon = new Icon({
    iconUrl: "/map-pin.png",
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
              onChange={(e) => selectCoordinates(e.target.value, longitude)}
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
              onChange={(e) => selectCoordinates(latitude, e.target.value)}
            />
          </label>
          <div className="coordinate-location" aria-live="polite" aria-atomic="true">
            {locationLookupStatus === "loading" && "Finding town/city…"}
            {locationLookupStatus === "success" && getLocationName(locationDetails)}
            {locationLookupStatus === "unavailable" && "Location name unavailable."}
            {locationDetails.postcode && <span> · Postcode {locationDetails.postcode}</span>}
          </div>
          <a
            className="coordinate-attribution"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            Location data © OpenStreetMap contributors
          </a>
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
            <button
              type="button"
              className="map-report-button"
              onClick={startReport}
              disabled={isCreatingReport}
            >
              {isCreatingReport ? "Saving location…" : "Report Danger"}
            </button>
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

        <MapClickHandler
          onLocationSelect={(lat, lng) => {
            selectCoordinates(lat, lng);
          }}
        />

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
        <button
          type="button"
          className="map-report-button"
          onClick={startReport}
          disabled={isCreatingReport}
        >
          {isCreatingReport ? "Saving location…" : "Report Danger"}
        </button>
      </div>
      {reportError && (
        <div className="map-report-error" role="alert">
          {reportError}
          <button
            type="button"
            onClick={() => setReportError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      {isReportFormOpen && (
        <div
          className="map-report-backdrop"
          onClick={() => setIsReportFormOpen(false)}
        >
          <section
            className="map-report-card"
            aria-label="Report a hazard"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="map-auth-close"
              aria-label="Close report form"
              onClick={() => setIsReportFormOpen(false)}
            >
              ×
            </button>
            <ReportDanger
              reportId={reportId}
              locationDetails={reportCoordinates === `${Number(latitude)},${Number(longitude)}` ? locationDetails : {}}
              onSubmitted={() => setIsReportFormOpen(false)}
            />
          </section>
        </div>
      )}
    </div>
  );
}

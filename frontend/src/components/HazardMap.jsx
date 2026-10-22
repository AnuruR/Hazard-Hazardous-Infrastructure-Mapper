import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useState, useEffect } from "react";

  function MapUpdater({latitude,longitude}){
    const map = useMap();

    useEffect(() => {
      map.setView([Number(latitude),Number(longitude)], map.getZoom());
    }, [longitude,latitude,map]);
    return null;
  }

export default function HazardMap() {
  const [latitude, setLatitude] = useState(6.9271);
  const [longitude, setLongitude] = useState(79.8612);
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
      <input
        className="hazard-map_latitude"
        type="number"
        step="any"
        placeholder="Enter latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        className="hazard-map_longitude"
        type="number"
        step="any"
        placeholder="Enter longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={13}
        className="hazard-map_container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater latitude={latitude} longitude={longitude}/>

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
    </div>
  );
}

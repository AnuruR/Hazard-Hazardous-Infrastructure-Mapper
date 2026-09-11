    import { useState } from "react";
    import heroImg from "./assets/hero.png";
    import reactLogo from "./assets/react.svg";
    import viteLogo from "./assets/vite.svg";
    import "./App.css";
    import {MapContainer, TileLayer} from "react-leaflet"

export default function App() {
  return <MapContainer center = {[6.9271, 79.8612]} zoom = {13} style = {{height: "100vh", width: "100%"}}>
<TileLayer
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
  </MapContainer>
}

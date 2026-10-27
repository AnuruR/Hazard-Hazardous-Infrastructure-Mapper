import {useState,useEffect} from "react"
import axios from "axios" 
import { Marker } from "react-leaflet"

const HazardMarkers = () => {
  const [reports, setReports] = useState([]);

useEffect (() => {
  const fetchReports = async () => {
    try {
const response = await axios.get(
  "http://localhost:5000/api/report"
);

console.log("Backend response:", response.data);

setReports(response.data.reports);
        
    } catch (error) {
        console.error("Failed to fetch hazard reports:", error);        
    }
  };

  fetchReports();
}, [])
  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[
            Number(report.latitude),
            Number(report.longitude),
          ]}
        />
      ))}
    </>
  );
};

export default HazardMarkers;
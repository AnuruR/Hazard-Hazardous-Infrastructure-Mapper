import { useState, useEffect } from "react";
import axios from "axios";
import { Marker, Popup } from "react-leaflet";

const HazardMarkers = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/report");

        console.log("Backend response:", response.data);

        setReports(response.data.reports);
      } catch (error) {
        console.error("Failed to fetch hazard reports:", error);
      }
    };

    fetchReports();

    const intervalId = setInterval(fetchReports, 3600000); //10000 means 10seconds

    return () => clearInterval(intervalId);
  }, []);
  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[Number(report.latitude), Number(report.longitude)]}
        >
          <Popup>
            <strong>Reported Hazard</strong>
            <p>Latitude: {report.latitude}</p>
            <p>Longitude: {report.longitude}</p>

            {report.topic && <p>Type: {report.topic}</p>}
            {report.severity && <p>Severity: {report.severity}</p>}
            {report.description && <p>{report.description}</p>}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default HazardMarkers;

import { useState, useEffect } from "react";
import axios from "axios";
import { Marker, Popup } from "react-leaflet";
import ResolveButton from "./ResolveButton";
import UndoResolveButton from "./UndoResolveButton";

const HazardMarkers = () => {
  const [reports, setReports] = useState([]);

  const handleResolve = async (reportId) => {
    try {
      const response = await axios.patch(
        `/api/report/${reportId}`,
        { resolved: "Yes" },
      );

      setReports((previousReports) =>
        previousReports.map((report) =>
          report._id === reportId ? response.data.report : report,
        ),
      );

      console.log("Hazard marked as resolved:", reportId);
    } catch (error) {
      console.error(
        "Failed to mark hazard as resolved:",
        error.response?.data ?? error.message,
      );
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/report");

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
            <p>Latitude: {Number(report.latitude).toFixed(3)}</p>
            <p>Longitude: {Number(report.longitude).toFixed(3)}</p>

            {report.topic && <p>Type: {report.topic}</p>}
            {report.severity && (
              <p>
                Severity: <span className={`hazard-severity hazard-severity--${String(report.severity).toLowerCase()}`}>{report.severity}</span>
              </p>
            )}
            {report.description && <p>{report.description}</p>}

            <ResolveButton
              report={report}
              onResolved={(updatedReport) => {
                setReports((previousReports) =>
                  previousReports.map((item) =>
                    item._id === updatedReport._id ? updatedReport : item,
                  ),
                );
              }}
            />
            <UndoResolveButton
              report={report}
              onResolved={(updatedReport) => {
                setReports((previousReports) =>
                  previousReports.map((item) =>
                    item._id === updatedReport._id ? updatedReport : item,
                  ),
                );
              }}
            />
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default HazardMarkers;

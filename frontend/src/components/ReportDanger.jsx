
import React, { useState } from "react";
import axios from "axios";

export default function ReportDanger({ location }) {
  const [reportData, setReportData] = useState({
    description: "",
    topic: "",
    severity: "High",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setReportData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!location) {
      alert("Please select a location on the map.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/report",
        {
          latitude: location.latitude,
          longitude: location.longitude,
          ...reportData,
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Report submission failed:", error);
      alert("Failed to submit the report.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Hazard topic
        <input
          name="topic"
          value={reportData.topic}
          onChange={handleChange}
          placeholder="e.g. Flood, Fire"
        />
      </label>

      <label>
        Description (optional)
        <textarea
          name="description"
          value={reportData.description}
          onChange={handleChange}
          placeholder="Describe the danger"
        />
      </label>

      <label>
        Severity
        <select
          name="severity"
          value={reportData.severity}
          onChange={handleChange}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>

      <button type="submit">Report Danger</button>
    </form>
  );
}

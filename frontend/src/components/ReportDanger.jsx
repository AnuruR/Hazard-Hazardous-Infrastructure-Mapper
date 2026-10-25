
import React, { useState } from "react";
import axios from "axios";

export default function ReportDanger({ location, onSubmitted }) {
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
      onSubmitted?.();
    } catch (error) {
      console.error("Report submission failed:", error);
      alert("Failed to submit the report.");
    }
  };

  return (
    <form className="report-danger-form" onSubmit={handleSubmit}>
      <label>
        <span>Hazard topic <span className="report-field-optional">Optional</span></span>
        <input
          name="topic"
          value={reportData.topic}
          onChange={handleChange}
          placeholder="e.g. Flood, Fire"
        />
      </label>

      <label>
        <span>Description <span className="report-field-optional">Optional</span></span>
        <textarea
          name="description"
          value={reportData.description}
          onChange={handleChange}
          placeholder="Describe the danger"
        />
      </label>

      <label>
        <span>Severity <span className="report-field-optional">Optional</span></span>
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


import { useState } from "react";
import axios from "axios";

export default function ReportDanger({ reportId, locationDetails, onSubmitted }) {
  const [reportData, setReportData] = useState({
    description: "",
    topic: "",
    severity: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setReportData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reportId || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const savedLocationDetails = Object.fromEntries(
        ["city", "town", "postcode"]
          .filter((field) => typeof locationDetails?.[field] === "string" && locationDetails[field].trim())
          .map((field) => [field, locationDetails[field].trim()])
      );
      const response = await axios.patch(
        `http://localhost:5000/api/report/${reportId}`,
        {
          ...reportData,
          ...(Object.keys(savedLocationDetails).length ? { locationDetails: savedLocationDetails } : {}),
        }
      );

      alert(response.data.message);
      onSubmitted?.();
    } catch (error) {
      console.error("Report submission failed:", error);
      setSaveError(
        error.response?.data?.message || "Failed to update the saved report."
      );
    } finally {
      setIsSaving(false);
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
          <option value="">Select severity (optional)</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>

      {saveError && <p className="report-form-error" role="alert">{saveError}</p>}
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving details…" : "Save details"}
      </button>
    </form>
  );
}

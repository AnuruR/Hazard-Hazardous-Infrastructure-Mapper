import { useState } from "react";
import axios from "axios";

export default function UndoReportDanger({
  reportId,
  onUndoSuccess,
}) {
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState("");

  const handleUndo = async () => {
    if (!reportId || isUndoing) return;

    if (!window.confirm("Do you want to undo your hazard report?")) {
      return;
    }

    setIsUndoing(true);
    setError("");

    try {
      await axios.delete(
        `http://localhost:5000/api/report/${encodeURIComponent(reportId)}`
      );

      onUndoSuccess?.(reportId);
    } catch (err) {
      console.error("Undo report failed:", err);

      setError(
        err.response?.data?.message ||
          "Could not undo the report. Please try again."
      );
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="undo-report-container">
      <button
        type="button"
        className="undo-report-button"
        onClick={handleUndo}
        disabled={isUndoing}
      >
        {isUndoing ? "Undoing report..." : "Undo Report"}
      </button>

      {error && (
        <p className="undo-report-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import axios from "axios";

const UndoResolveButton = ({ report, onResolved }) => {
  const [loading, setLoading] = useState(false);
  const isResolved = report.resolved === "Yes";

  const handleUndoResolve = async () => {
    if (loading || !isResolved) return;

    setLoading(true);

    try {
      const response = await axios.patch(
        `/api/report/${report._id}`,
        { resolved: "No" }
      );

      onResolved(response.data.report);
    } catch (error) {
      console.error(
        "Failed to undo hazard resolution:",
        error.response?.data ?? error.message
      );

      alert("Failed to undo resolution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="undo-resolve-button"
      type="button"
      onClick={handleUndoResolve}
      disabled={loading || !isResolved}
    >
      {loading
        ? "Updating..."
        : isResolved
          ? "Undo Resolution"
          : "Undo Resolution"}
    </button>
  );
};

export default UndoResolveButton;


import { useState } from "react";
import axios from "axios";

const ResolveButton = ({ report, onResolved }) => {
  const [loading, setLoading] = useState(false);
  const isResolved = report.resolved === "Yes";

  const handleResolve = async () => {
    if (loading || isResolved) return;

    setLoading(true);

    try {
      const response = await axios.patch(
        `/api/report/${report._id}`,
        { resolved: "Yes" }
      );

      onResolved(response.data.report);
    } catch (error) {
      console.error(
        "Failed to mark hazard as resolved:",
        error.response?.data ?? error.message
      );

      alert("Failed to mark this hazard as resolved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="resolve-button"
      type="button"
      onClick={handleResolve}
      disabled={loading || isResolved}
    >
      {loading
        ? "Updating..."
        : isResolved
          ? "Resolved"
          : "Mark as Resolved"}
    </button>
  );
};

export default ResolveButton;

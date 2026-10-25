import { reportHazard } from "../models/HazardReport.js";

export async function createReport(req, res) {
  const { latitude, longitude } = req.body ?? {};
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      message: "Latitude and longitude must be valid numbers.",
    });
  }
  try {
    const report = await reportHazard(req.body);

    res.status(201).json({
      message: "Hazard reported successfully",
      report,
    });
  } catch (error) {
    console.error("Report creation failed:", error);

    res.status(500).json({
      message: "Failed to report hazard",
    });
  }
}

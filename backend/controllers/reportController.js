import {
  reportHazard,
  updateHazardReport,
} from "../models/HazardReport.js";

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
    const report = await reportHazard({ latitude, longitude });

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

export async function updateReport(req, res) {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return res.status(400).json({ message: "Report ID is invalid." });
  }

  const body = req.body ?? {};
  const details = {};
  for (const field of ["topic", "description", "severity"]) {
    if (Object.hasOwn(body, field)) {
      if (typeof body[field] !== "string") {
        return res.status(400).json({ message: `${field} must be text.` });
      }
      details[field] = body[field].trim();
    }
  }

  if (Object.hasOwn(body, "locationDetails")) {
    const source = body.locationDetails;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return res.status(400).json({ message: "locationDetails must be an object." });
    }

    const locationDetails = {};
    for (const field of ["city", "town", "postcode"]) {
      if (!Object.hasOwn(source, field)) continue;
      const maxLength = field === "postcode" ? 32 : 300;
      if (typeof source[field] !== "string" || source[field].length > maxLength) {
        return res.status(400).json({ message: `locationDetails.${field} is invalid.` });
      }
      const value = source[field].trim();
      if (value) locationDetails[field] = value;
    }
    if (Object.keys(locationDetails).length) details.locationDetails = locationDetails;
  }

  if (details.severity && !["High", "Medium", "Low"].includes(details.severity)) {
    return res.status(400).json({ message: "Severity is invalid." });
  }

  try {
    const report = await updateHazardReport(id, details);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }
    return res.json({ message: "Report details updated", report });
  } catch (error) {
    console.error("Report update failed:", error);
    return res.status(500).json({ message: "Failed to update report." });
  }
}

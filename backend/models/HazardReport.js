import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const hazardreports = () => getDB().collection("hazard_reports");

// export const findByLocation = (longtitude, latitude) => {
//     hazardreports.findOne({longtitude, latitude});
//     return {longtitude, latitude}
// }

export async function reportHazard(detail) {
  const reportData = {
    latitude: detail.latitude,
    longitude: detail.longitude,
    description: detail.description ?? "",
    topic: detail.topic ?? "",
    severity: detail.severity ?? "High",
    createdAt: new Date(),
  };
  const { insertedId } = await hazardreports().insertOne(reportData);
  return { ...reportData, _id: insertedId };
}

export async function updateHazardReport(id, details) {
  const _id = new ObjectId(id);
  const update = {};

  for (const field of ["topic", "description", "severity", "locationDetails"]) {
    if (Object.hasOwn(details, field)) {
      update[field] = details[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return hazardreports().findOne({ _id });
  }

  return hazardreports().findOneAndUpdate(
    { _id },
    { $set: update },
    { returnDocument: "after" }
  );
}

export async function fetchAllReports() {
  return hazardreports().find().toArray();
}
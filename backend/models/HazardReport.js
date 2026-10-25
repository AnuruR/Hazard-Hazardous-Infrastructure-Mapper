import { getDB } from "../config/db.js";

const hazardreports = () => getDB().collection("hazard_reports");

// export const findByLocation = (longtitude, latitude) => {
//     hazardreports.findOne({longtitude, latitude});
//     return {longtitude, latitude}
// }

export async function reportHazard(detail) {
  const reportData = {
    latitude: detail.latitude,
    longitude: detail.longitude,
    description: detail.description ?? null,
    topic: detail.topic ?? null,
    severity: detail.severity ?? "High",
    createdAt: new Date(),
  };
  const { insertedId } = await hazardreports().insertOne(reportData);
  return { ...reportData, _id: insertedId };
}

import { getDB } from "../config/db.js";

const hazardreports = () => getDB().collection("hazard_reports")

// export const findByLocation = (longtitude, latitude) => {
//     hazardreports.findOne({longtitude, latitude});
//     return {longtitude, latitude}
// }

export async function reportHazard (detail)  {
    const { insertedId }  = await hazardreports().insertOne(detail)
    return { ...detail, _id:insertedId}
}  
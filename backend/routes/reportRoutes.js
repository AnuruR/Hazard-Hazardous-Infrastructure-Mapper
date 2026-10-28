import express from "express";
import {
  createReport,
  updateReport,
  getAllReports,
  deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", createReport);
router.patch("/:id", updateReport);
router.get("/", getAllReports);
router.delete("/:id", deleteReport);

export default router;

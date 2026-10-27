import express from "express";
import {
  createReport,
  updateReport,
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", createReport);
router.patch("/:id", updateReport);
router.get("/", getAllReports);

export default router;

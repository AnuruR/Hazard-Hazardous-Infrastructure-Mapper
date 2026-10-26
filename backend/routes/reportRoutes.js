import express from "express";
import {
  createReport,
  updateReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", createReport);
router.patch("/:id", updateReport);

export default router;

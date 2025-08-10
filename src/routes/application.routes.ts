import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import { applyJob, getMyApplications, getApplicationsForJob, updateApplicationStatus } from "../controllers/application.controller";
import { upload } from "../utils/cloudinary.utils";

const router = Router();

router.use(protect);

router.post("/:id/apply", authorize("applicant"), upload.single("resume"), applyJob);
router.get("/my", authorize("applicant"), getMyApplications);
router.get("/job/:jobId", authorize("company"), getApplicationsForJob);
router.put("/:id/status", authorize("company"), updateApplicationStatus);

export default router;
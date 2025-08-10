import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import { createJob, updateJob, deleteJob, getJobs, getJobById, getMyJobs } from "../controllers/job.controller";

const router = Router();

router.use(protect);

router.post("/", authorize("company"), createJob);
router.get("/", authorize("applicant"), getJobs);
router.get("/my", authorize("company"), getMyJobs);
router.route("/:id")
    .get(getJobById)
    .put(authorize("company"), updateJob)
    .delete(authorize("company"), deleteJob);

export default router;
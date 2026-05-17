import express from "express";
import applicationController from "../controllers/applicationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", applicationController.createApplication);
router.get("/", applicationController.getApplications);
router.get("/stats", applicationController.getApplicationStats);
router.get("/:id", applicationController.getApplication);
router.put("/:id", applicationController.updateApplication);
router.delete("/:id", applicationController.deleteApplication);

export default router;

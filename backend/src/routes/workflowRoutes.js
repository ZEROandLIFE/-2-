import express from "express";
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  startWorkflow,
  approveWorkflow,
  getWorkflowInstances,
  getMyApprovalList,
  getWorkflowInstance,
} from "../controllers/workflowController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 我的审批
router.get("/my-approvals", authenticateToken, getMyApprovalList);

// 流程实例
router.post("/instances", authenticateToken, startWorkflow);
router.get("/instances", authenticateToken, getWorkflowInstances);
router.get("/instances/:id", authenticateToken, getWorkflowInstance);
router.put("/instances/:id/approve", authenticateToken, approveWorkflow);

// 流程定义
router.post("/", authenticateToken, createWorkflow);
router.get("/", authenticateToken, getWorkflows);
router.get("/:id", authenticateToken, getWorkflow);
router.put("/:id", authenticateToken, updateWorkflow);
router.delete("/:id", authenticateToken, deleteWorkflow);

export default router;

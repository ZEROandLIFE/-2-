import express from "express";
import * as organizationController from "../controllers/organizationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware.protect);

// 部门管理
router.post("/departments", organizationController.createDepartment);
router.get("/departments", organizationController.getDepartments);
router.get("/departments/:id", organizationController.getDepartment);
router.put("/departments/:id", organizationController.updateDepartment);
router.delete("/departments/:id", organizationController.deleteDepartment);

// 部门成员管理
router.post("/departments/:departmentId/members", organizationController.addDepartmentMember);
router.get("/departments/:departmentId/members", organizationController.getDepartmentMembers);
router.delete("/departments/:departmentId/members/:userId", organizationController.removeDepartmentMember);

// 角色管理
router.post("/roles", organizationController.createRole);
router.get("/roles", organizationController.getRoles);
router.get("/roles/:id", organizationController.getRole);
router.put("/roles/:id", organizationController.updateRole);
router.delete("/roles/:id", organizationController.deleteRole);

// 用户部门查询
router.get("/users/:userId/departments", organizationController.getUserDepartments);

// 申请加入部门
router.post("/applications/join", organizationController.applyToJoinDepartment);
router.get("/applications/my", organizationController.getMyApplications);
router.get("/applications/department/:departmentId", organizationController.getDepartmentApplications);
router.put("/applications/:id/review", organizationController.reviewApplication);

// 获取所有用户（用于选择）
router.get("/users", organizationController.getAllUsers);

export default router;

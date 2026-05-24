import express from "express";
import {
  createForm,
  getForms,
  getAllForms,
  getForm,
  updateForm,
  deleteForm,
  createFormData,
  getFormDataList,
  getFormData,
  updateFormData,
  deleteFormData,
} from "../controllers/formController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createForm);
router.get("/", authenticateToken, getForms);
router.get("/all", authenticateToken, getAllForms);
router.get("/:id", authenticateToken, getForm);
router.put("/:id", authenticateToken, updateForm);
router.delete("/:id", authenticateToken, deleteForm);

router.post("/:formId/data", authenticateToken, createFormData);
router.get("/:formId/data", authenticateToken, getFormDataList);
router.get("/:formId/data/:dataId", authenticateToken, getFormData);
router.put("/:formId/data/:dataId", authenticateToken, updateFormData);
router.delete("/:formId/data/:dataId", authenticateToken, deleteFormData);

export default router;

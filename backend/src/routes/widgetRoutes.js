import express from "express";
import widgetController from "../controllers/widgetController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", widgetController.getWidgets);
router.get("/search", widgetController.searchWidgets);
router.get("/categories", widgetController.getCategories);
router.get("/:id", widgetController.getWidget);
router.post("/", widgetController.createWidget);
router.post("/categories", widgetController.createCategory);
router.post("/import", widgetController.importWidgets);
router.get("/export", widgetController.exportWidgets);
router.put("/:id", widgetController.updateWidget);
router.delete("/:id", widgetController.deleteWidget);

export default router;

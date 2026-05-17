import express from "express";
import pageController from "../controllers/pageController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", pageController.createPage);
router.get("/", pageController.getPages);
router.get("/:id", pageController.getPage);
router.put("/:id", pageController.updatePage);
router.delete("/:id", pageController.deletePage);

export default router;

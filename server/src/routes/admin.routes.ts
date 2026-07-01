import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import * as adminController from "../controllers/admin.controller";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/courses", asyncHandler(adminController.listCourses));
router.put("/courses/:id", asyncHandler(adminController.updateCourse));

router.get("/courses/:courseId/topics", asyncHandler(adminController.listTopics));
router.post("/courses/:courseId/topics", asyncHandler(adminController.createTopic));
router.put("/topics/:id", asyncHandler(adminController.updateTopic));
router.delete("/topics/:id", asyncHandler(adminController.deleteTopic));

router.get("/topics/:topicId/materials", asyncHandler(adminController.listMaterials));
router.post("/topics/:topicId/materials", asyncHandler(adminController.createMaterial));
router.put("/materials/:id", asyncHandler(adminController.updateMaterial));
router.delete("/materials/:id", asyncHandler(adminController.deleteMaterial));

router.get("/purchases", asyncHandler(adminController.listPurchases));

router.get("/users", asyncHandler(adminController.searchUsers));
router.get("/users/:id/access", asyncHandler(adminController.getUserAccess));
router.post("/users/:id/courses/:courseId/grant", asyncHandler(adminController.grantAccess));
router.post("/users/:id/courses/:courseId/revoke", asyncHandler(adminController.revokeAccess));

export default router;

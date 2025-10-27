import { asyncHandler } from "@/shared/utils/async-handler";
import { cacheMiddleware } from "@/middlewares/cache.middleware";
import { UserController } from "../../controllers/v1/user.controller";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
// import { blocklistMiddleware } from "@/middlewares/blocklist.middleware";

const router = Router();

const userController = new UserController();

router.get(
  "/",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.getAllUsers.bind(userController))
);

router.patch(
  "/me",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.updateCurrentUser.bind(userController))
);
router.get(
  "/me",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.patch(
  "/:userId",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.updateUserData.bind(userController))
);
router.patch(
  "/:userId/block",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.blockUser .bind(userController))
);
router.patch(
  "/:userId/unblock",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(userController.unBlockUser.bind(userController))
);

router.get(
  "/:userId",
  authenticate,
  asyncHandler(userController.getUser.bind(userController))
);

router.post(
  "/instructors/register",
  authenticate,
  asyncHandler(userController.registerInstructor.bind(userController))
);



export { router as userRouter };

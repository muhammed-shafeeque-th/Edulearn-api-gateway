import { blocklistMiddleware } from "../../middlewares/blocklist.middleware";
import { userRoutesV1 } from "../../domains/user/routers/v1/users.router";
import {Router} from "express";

const router = Router();
router.use("/users",  userRoutesV1);

export {router as userRouterV1};
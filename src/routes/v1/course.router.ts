import { courseRouter } from "../../domains/course/routers/v1/course.router";
import {Router} from "express";

const router = Router();
router.use("/courses", courseRouter);

export {router as courseRouterV1};
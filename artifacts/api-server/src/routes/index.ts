import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sarathiRouter from "./sarathi";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sarathiRouter);

export default router;

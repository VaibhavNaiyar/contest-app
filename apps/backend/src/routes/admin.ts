import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";

const router: Router = Router();

router.use(adminMiddleware);

// admin routes go here

export default router;

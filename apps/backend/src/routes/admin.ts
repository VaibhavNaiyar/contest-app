import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";
import { userMiddleware } from "../middleware/user";

const router: Router = Router();

router.use(adminMiddleware);

router.post("/contest", (req, res) => {
    const { offset, page } = req.query;

})

router.post("/challenge", (req, res) => {
    const { offset, page } = req.query;

})

router.post("/link/:challengeId/:contestId", (req, res) => {
    const { offset, page } = req.query;

})

router.delete("/link/:challengeId/:contestId", (req, res) => {
    const { offset, page } = req.query;

})

export default router;

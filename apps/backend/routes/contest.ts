import {Router} from "express";

const router = Router();


//https://devforces.com/contest?offset=10&page=20
router.get("/active",(req,res) => {
    const {offset,page} = req.query;
})


router.get("/finished",(req,res) => {
    let {offset , page} = req.query;
})

//return all the sub challenge and their start times.
router.get("/:contestId",(req,res) => {
    const {contestId} = req.params;
    
})


router.get("/:contestId/:challengeId",(req,res) => {
    const contestId = req.params.contestId;
})

router.get("/leaderboard/:contestId",(req,res) => {

})

router.get("/submit/:challengeId",(req,res) => {
    //have rate limiting
    //MAX 20 submisiions
    //store the response in sorted set and DB
})


export default router;
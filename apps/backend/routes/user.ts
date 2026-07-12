import {Router} from "express";
import { client } from "@repo/db";
import {SignupSchema} from "../types";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mail";

const router = Router();

router.post("/signin", async (req,res) => {
    const {success,data} = SignupSchema.safeParse(req.body);

    if(!success) {
        res.status(411).json({
            message:"Incorrect email format"
        })
        return;
    }

    const user = await client.user.upsert({
        create: {
            email:data.email,
            role:"User"
        },
        update: {
            email:data.email
        },
        where: {
            email:data.email
        }
    });

    const token = jwt.sign({
        userId:user.id
    },process.env.EMAIL_JWT_PASSWORD!);

    if (process.env.NODE_ENV === "production") {
        await sendEmail(data.email , `Login to Contest platform`, `Click on the link to login : ${process.env.FRONTEND_URL}/login?token=${token}`);
    }
    else {
        console.log(`the link for ${data.email} to login is : ${process.env.FRONTEND_URL}/login?token=${token}`);
    }

    res.json({
        messages:"We have emailed the one time login link to you"
    })
    
})


router.get("/signin/post", async (requestAnimationFrame,res)=> {
    try {
        const token = req.query.token as string;
        const decoded = jwt.verify(token,process.env.EMAIL_JWT_PASSWORD!) as JwtPayload;
        if(decoded.userId){
            const token = jwt.sign({
                userId:decoded.userId
            },process.env.USER_JWT_PASSWORD!);

            res.json({
                token
            })
        }
    } catch(e){
        res.status(411).json({
            message:"Invalid token"
        })
    }
})


export default router;
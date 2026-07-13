import {Router} from "express";
import { client } from "@repo/db";
import {SignupSchema} from "../types";
import jwt, { JwtPayload } from "jsonwebtoken";
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
        },
        update: {
            email:data.email
        },
        where: {
            email:data.email
        }
    });

    const emailToken = jwt.sign({
        userId:user.id
    },process.env.EMAIL_JWT_PASSWORD!);

    const loginLink = `${process.env.FRONTEND_URL}/login/callback?token=${emailToken}`;

    if (process.env.NODE_ENV === "production") {
        await sendEmail(data.email, `Login to Dev-Forces`, `Click the link to sign in: ${loginLink}`);
    } else {
        console.log(`Login link for ${data.email}: ${loginLink}`);
    }

    res.json({
        message:"We have emailed the one time login link to you"
    })

})


router.get("/signin/post", async (req,res) => {
    try {
        const token = req.query.token as string;
        const decoded = jwt.verify(token,process.env.EMAIL_JWT_PASSWORD!) as JwtPayload;
        if(decoded.userId){
            const user = await client.user.findFirst({ where: { id: decoded.userId } });
            const sessionToken = jwt.sign({
                userId:decoded.userId,
                role: user?.role
            },process.env.USER_JWT_PASSWORD!);

            res.json({
                token: sessionToken
            })
        }
    } catch(e){
        res.status(411).json({
            message:"Invalid token"
        })
    }
})


export default router;

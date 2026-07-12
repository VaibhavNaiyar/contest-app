import type {NextFunction , Request , Response } from "express";
import jwt , { JwtPayload } from "jsonwebtoken";

export function adminMiddleware(req: Request , res: Response , next: NextFunction) {
    const token = req.headers.authorization as string;
    try {
        const decoded = jwt.verify(token,process.env.ADMIN_JWT_PASSWORD!) as JwtPayload;
        if(decoded.adminId) {
            next();
        } else {
            res.status(403).json({
                message:"Access denied"
            })
        }
    } catch(e) {
        res.status(403).json({
            message:"Invalid token"
        })
    }
}

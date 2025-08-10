import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User.model";
import ErrorResponse from "../utils/error-response.utils";

export interface AuthRequest extends Request {
    user?: User;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = "";

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorResponse("Not authorized", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new ErrorResponse("Not authorized", 401));
        }
        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorResponse("Not authorized", 401));
    }
};

const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorResponse("Role not authorized", 403));
        }
        next();
    };
};

export { protect, authorize };
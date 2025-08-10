import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.model";
import ErrorResponse from "../utils/error-response.utils";
import sendEmail from "../utils/email.utils";

const sendTokenResponse = (user: User, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || "10") * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message: "Success",
        object: { id: user.id, name: user.name, email: user.email, role: user.role, token },
        errors: null,
    });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate name: alphabets and one space
        if (!/^[a-zA-Z]+ [a-zA-Z]+$/.test(name)) {
            return next(new ErrorResponse("Invalid name format", 400));
        }

        if (!validator.isEmail(email)) {
            return next(new ErrorResponse("Invalid email", 400));
        }

        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            return next(new ErrorResponse("Password not strong enough", 400));
        }

        if (!["applicant", "company"].includes(role)) {
            return next(new ErrorResponse("Invalid role", 400));
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return next(new ErrorResponse("User already exists", 400));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
        });

        // Generate verification token (1h expire)
        const verifyToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        // Send verification email
        const verifyUrl = `http://localhost:8000/api/auth/verify?token=${verifyToken}`;
        await sendEmail(user.email, "Verify Your Email", `Click to verify: ${verifyUrl}`);

        res.status(201).json({
            success: true,
            message: "User registered, verification email sent",
            object: null,
            errors: null,
        });
    } catch (error) {
        next(new ErrorResponse("Server error", 500));
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query;

        if (!token) {
            return next(new ErrorResponse("No token provided", 400));
        }

        let decoded;
        try {
            decoded = jwt.verify(token as string, process.env.JWT_SECRET || "secret") as { id: string };
        } catch (err) {
            // If expired, send new token
            if ((err as any).name === "TokenExpiredError") {
                // Find user by decoding without expiration check
                const decodedExpired = jwt.decode(token as string) as { id: string };
                const user = await User.findByPk(decodedExpired.id);
                if (user) {
                    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
                    const verifyUrl = `http://localhost:8000/api/auth/verify?token=${newToken}`;
                    await sendEmail(user.email, "Verify Your Email (New Token)", `Previous token expired. Click to verify: ${verifyUrl}`);
                    return res.status(200).json({ success: true, message: "Token expired, new verification email sent", object: null, errors: null });
                }
                return next(new ErrorResponse("Invalid token", 400));
            }
            return next(new ErrorResponse("Invalid token", 400));
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, message: "Email already verified", object: null, errors: null });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully", object: null, errors: null });
    } catch (error) {
        next(new ErrorResponse("Server error", 500));
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        if (!user.isVerified) {
            return next(new ErrorResponse("Email not verified", 401));
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(new ErrorResponse("Server error", 500));
    }
};
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";
import { validationRegistrationData } from "../utils/auth.helper"


export const userRegistration = async (req: Request<any, any, { name?: string; email?: string }>, res: Response, next: NextFunction) => {
    try {
        validationRegistrationData(req.body, 'user');
        const {name, email } = req.body;
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            throw new ValidationError("User with this email already exists");
        };
        await checkOtpRestriction(email,next)

        // TODO: create user and return appropriate response
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        next(err);
    }
}
import crypto from 'crypto';
import redis from '../../../../packages/libs/redis';
import { ValidationError } from '../../../../packages/error-handler';
import { sendMail } from './sendMail';
import { NextFunction, Request, Response } from 'express';
import prismadb from '../../../../packages/libs/prisma';
import prisma from '../../../../packages/libs/prisma';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationRegistrationData = (data: any, userType: 'user' | 'seller') => {
    const { name, email, password, phone_number, country } = data;
    if(
        !name ||
        !email ||
        !password ||
        (userType==='seller' && (!phone_number || !country  ))
    ){
        throw new ValidationError("Missing required fields for registration", )
    }
    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid email format")
    }

}

export const checkOtpRestriction = async (email: string,next:NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        throw new ValidationError("Account lock due to Too many OTP requests. Please try again later.");
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        throw new ValidationError("Too many OTP requests. Please try again later.");
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError("Please wait 1 minute before requesting another OTP.");
    }
}

export const trackOtpRequest = async(email: string,next:NextFunction) => {
    try {
        const requestsKey = `otp_requests:${email}`;
        console.log('Checking Redis key:', requestsKey);
        
        // read current count
        const otpRequestsStr = await redis.get(requestsKey);
        console.log('Current OTP requests:', otpRequestsStr);
        
        const otpRequests = parseInt(otpRequestsStr ?? '0', 10) + 1;
        console.log('New OTP requests count:', otpRequests);

        // persist the incremented value
        await redis.set(requestsKey, otpRequests.toString());
        
        if(otpRequests === 1) {
            await redis.expire(requestsKey, 15 * 60); // 15 minutes window
        }
        
        // No OTP restrictions for development
        return;
        
        /* Temporarily disabled for testing*/
        if(otpRequests > 5) {
            await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 30 * 60);
            throw new ValidationError("Too many OTP requests. Please try again later.");
        }
        if(otpRequests > 3){
            await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 2 * 60);
        }
        if(otpRequests === 5){
            await redis.set(`otp_lock:${email}`, 'true', 'EX', 15 * 60);
            throw new ValidationError("Account lock due to Too many OTP requests. Please try again later.");
        }
        
    } catch (error) {
        console.error('Redis error in trackOtpRequest:', error);
    }
}

export const sendOtp = async(email:string, name:string, template:string) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    await sendMail(email, "Your OTP Code", template, {name, otp});
    await redis.set(`otp:${email}`, otp, 'EX', 10 * 60); // OTP valid for 10 minutes
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 2 * 60); // Cooldown for 2 minutes       
    }
export const verfyOtp = async(email:string, otp:string,next:NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new ValidationError("Invalid or expired OTP");
    }
    const faildAttemptsKey = `otp_faild_attempts:${email}`;
    const faildAttemptsStr = await redis.get(faildAttemptsKey);
    const faildAttempts = parseInt(faildAttemptsStr ?? '0', 10);

    if (storedOtp !== otp) {
        const newFaildAttempts = faildAttempts + 1;
        await redis.set(faildAttemptsKey, newFaildAttempts.toString(), 'EX', 15 * 60); // 15 minutes window

        if (newFaildAttempts >= 5) {
            await redis.set(`otp_lock:${email}`, 'true', 'EX', 15 * 60); // Lock account for 15 minutes
            await redis.del(faildAttemptsKey); // Reset faild attempts after locking
            throw new ValidationError("Account locked due to too many failed OTP attempts. Please try again later.");
        } else {
            throw new ValidationError(`Invalid OTP. Please try again. ${5 - newFaildAttempts} attempts left.`);
        }
    }   
    // OTP is valid, delete it to prevent reuse
    await redis.del(`otp:${email}`);
}

export const handleForgotPassword = async (req:Request,res:Response,next:NextFunction,userType:"user"|"seller") => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new ValidationError("Email is required");
        }

        let user: any | null;
        if (userType === "user") {
            user = await prismadb.users.findUnique({ where: { email } });
        } else {
            user = await prismadb.sellers.findUnique({ where: { email } });
        }
        if (!user) {
            throw new ValidationError("User with this email does not exist");
        }

        // Check OTP restrictions and send OTP
        await checkOtpRestriction(email,next);
        await trackOtpRequest(email,next);
        await sendOtp(email, user.name , "password-reset-mail");


        res.status(200).json({ message: "OTP sent to email for verify your account" });
    } catch (error) {
        return next(error);
    }
}

export const VerifyForgotpasswordOtp = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw new ValidationError("Email and OTP are required");
        }
        await verfyOtp(email, otp, next);

        res.status(200).json({ 
            success: true,
            message: "OTP verified successfully" });
    } catch (error) {
        return next(error);
    }   
        
}



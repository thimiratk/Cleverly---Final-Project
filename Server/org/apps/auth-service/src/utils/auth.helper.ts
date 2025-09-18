import crypto from 'crypto';
import redis from '../../../../packages/libs/redis';


import { ValidationError } from '../../../../packages/error-handler';
import { sendMail } from './sendMail';


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

export const checkOtpRestriction = async (email:string, next:NewableFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
        return next(new ValidationError("Account lock due to Too many OTP requests. Please try again later."));

}   if(await redis.get(`otp_spam_lock:${email}`)){
        return next(new ValidationError("Too many OTP requests. Please try again later."));
}
}

export const sendOtp = async(name:string, email:string, template:string) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    await sendMail(email, "Your OTP Code", template, {name, otp});
    await redis.set(`otp:${email}`, otp, 'EX', 10 * 60); // OTP valid for 10 minutes
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 2 * 60); // Cooldown for 2 minutes       
    }
    


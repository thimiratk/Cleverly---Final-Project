import { Request, Response, NextFunction } from "express";
import { AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { handleForgotPassword, sendOtp, validationRegistrationData, verfyOtp, VerifyForgotpasswordOtp } from "../utils/auth.helper"
import { checkOtpRestriction } from "../utils/auth.helper"
import { trackOtpRequest } from "../utils/auth.helper"
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";


export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        validationRegistrationData(req.body, 'user');
        
        const { name, email, password } = req.body;
        
        // Additional validation
        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        // Check for existing user
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            throw new ValidationError("User with this email already exists");
        }

        // Check OTP restrictions and send OTP
        await checkOtpRestriction(email,next);
        await trackOtpRequest(email,next);
        await sendOtp(email, name ?? '', 'user-activation-mail');

        // OTP sent; return created status
        res.status(201).json({ message: "OTP sent to email for verification" });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Registration error:', error);
            res.status(500).json({ error: "Something went wrong during registration" });
        }
    }
}
export const verifyUser = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { email, otp,password,name  } = req.body;
        if (!email || !otp || !password || !name) {
            throw new ValidationError("All feilds are required");
        }
        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            throw new ValidationError("User with this email already exists");
        }
        await verfyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hashSync(password, 10);
        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        res.status(201).json({ 
            success: true,
            message: "User verified successfully" });
    } catch (error) {
        return next(error);
    }   
        
}


export const userLogin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError("Invalid email , user does not exist");
        }
        if (user.provider === 'google') {
            throw new ValidationError("Please login with Google");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid password");
        }
        // Generate JWT token (implementation omitted for brevity)

        const accessToken = jwt.sign(
  { id: user.id, role: user.role.toLowerCase() },   // Use actual user role from database
  process.env.ACCESS_TOKEN_SECRET as string,
  { expiresIn: '1h' }
);

const refreshToken = jwt.sign(
  { id: user.id, role: user.role.toLowerCase() },   // Use actual user role from database
  process.env.REFRESH_TOKEN_SECRET as string,
  { expiresIn: '7h' }
);


        setCookie(res, 'refreshToken', refreshToken);
        setCookie(res, 'accessToken', accessToken);

        res.status(200).json({ 
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            accessToken: accessToken // Include token in response for cross-origin access
        });
    } catch (error) {
        return next(error);
    }
} 

export const userForgotPassword = async(req:Request,res:Response,next:NextFunction)=>{
        await handleForgotPassword(req,res,next,'user')
    
} 
export const userVerifyForgotpasswordOtp = async(req:Request,res:Response,next:NextFunction)=>{
    await VerifyForgotpasswordOtp(req,res,next);
}

export const resetUserPassword = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next( new ValidationError("Email and new password are required"));
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
           return next(  new ValidationError("User with this email does not exist"));
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return next(  new ValidationError("New password must be different from the old password"));
        }
        const hashedPassword = await bcrypt.hashSync(newPassword, 10);
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        });
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return next(error);
    }
}

export const userLogout = async (req:Request,res:Response,next:NextFunction) => {
    try {
        // Clear the cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return next(error);
    }
}

export const refreshToken = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return next( new ValidationError("Refresh token not found, please login again"));
        }
        // Verify refresh token
        
        const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET as string  
            ) as {id:string,role:string};
            
        if(!decoded || !decoded.id || !decoded.role){
                return next(new JsonWebTokenError("Invalid token payload, please login again"));
            }
        // let account;
        // if(decoded.role === 'user')
        const users =await prisma.users.findUnique({ where: { id: decoded.id } });
        
        if (!users) {
            return next(new AuthError("User not found, please login again"));
        }
            // Generate new tokens
            const newAccessToken = jwt.sign(
                { id:decoded.id, role:decoded.role },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: '1h' }
            );
            const newRefreshToken = jwt.sign(
                { id:decoded.id, role:decoded.role},
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: '7h' }
            );

            // Set new tokens in cookies
            setCookie(res, 'accessToken', newAccessToken);
            setCookie(res, 'refreshToken', newRefreshToken);

            res.status(200).json({ 
                success: true });
       
    } catch (error) {
        return next(error);
    }
}   

export const getUser = async (req: any, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Fetch complete user data including profile picture
    const fullUser = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        coverPicture: true,
        bio: true,
        trustScore: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
      }
    });

    if (!fullUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: fullUser,
    });
  } catch (error) {
    console.error("Error in getUser controller:", error);
    next(error);
  }
};

// Get count of users
export const getUserCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.users.count();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      return;
    }
    if (user.provider && user.provider !== 'google') {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=login_method_restricted`);
      return;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7h' }
    );

    // Set cookies
    setCookie(res, 'refreshToken', refreshToken);
    setCookie(res, 'accessToken', accessToken);

    // Redirect to frontend home page with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/`);
    return;
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    return;
  }
};


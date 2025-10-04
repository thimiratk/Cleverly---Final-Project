import express,{ Router } from 'express';
import {getUser, refreshToken,resetUserPassword, userForgotPassword, userLogin, userLogout, userRegistration, userVerifyForgotpasswordOtp, verifyUser } from '../controllers/auth_controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUser);
router.post(`/login` , userLogin);
router.post('/logout', userLogout);
router.post('/refresh-token', refreshToken);
router.get(`/api/auth/me`,isAuthenticated,getUser);
router.post(`/forgot-password`, userForgotPassword);
router.post(`/verify-forgot-password-otp`, userVerifyForgotpasswordOtp);
router.post(`/reset-password`, resetUserPassword);


export default router;
import express,{ Router } from 'express';
import {resetUserPassword, userForgotPassword, userLogin, userLogout, userRegistration, userVerifyForgotpasswordOtp, verifyUser } from '../controllers/auth_controller';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUser);
router.post(`/login` , userLogin);
router.post('/logout', userLogout);
router.post(`/forgot-password`, userForgotPassword);
router.post(`/verify-forgot-password-otp`, userVerifyForgotpasswordOtp);
router.post(`/reset-password`, resetUserPassword);


export default router;
import express,{ Router } from 'express';
import {resetUserPassword, userForgotPassword, userLogin, userRegistration, userVerifyForgotpasswordOtp, verifyUser } from '../controllers/auth_controller';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUser);
router.post(`/loign` , userLogin);
router.post(`/forgot-password-user`, userForgotPassword);
router.post(`/verify-forgot-password-otp-user`, userVerifyForgotpasswordOtp);
router.post(`/reset-password-user`, resetUserPassword);


export default router;
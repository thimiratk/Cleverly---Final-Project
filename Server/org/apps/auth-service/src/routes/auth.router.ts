import express,{ Router } from 'express';
import passport from 'passport';
import {getUser, refreshToken,resetUserPassword, userForgotPassword, userLogin, userLogout, userRegistration, userVerifyForgotpasswordOtp, verifyUser, googleAuthCallback, getUserCount } from '../controllers/auth_controller';
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

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleAuthCallback);

router.get('/users/count', getUserCount);

export default router;

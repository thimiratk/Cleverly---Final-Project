# OTP Reset Password Error Fix

## Issues Identified and Fixed

### 1. **API Gateway Routing Issue (CRITICAL)**
**Problem:** The API gateway was missing routes for forgot password endpoints, causing 404 errors.

**Location:** `Server/org/apps/api-gateway/src/main.ts`

**Fix Applied:**
```typescript
// Added these routes to the auth service proxy:
app.use([
  "/api/login", 
  "/api/register", 
  "/api/verify", 
  "/api/logout", 
  "/api/refresh-token", 
  "/api/auth", 
  "/api/forgot-password",              // ✅ Added
  "/api/verify-forgot-password-otp",   // ✅ Added
  "/api/reset-password"                // ✅ Added
], proxy("http://localhost:6001", {...}));
```

**Explanation:** The API gateway acts as a proxy between the frontend and microservices. Without these routes, requests to `/api/forgot-password` returned 404.

### 2. **SMTP Configuration Issue**
**Problem:** The SMTP transporter was missing the `secure` flag for port 465.

**Location:** `Server/org/apps/auth-service/src/utils/sendMail/index.ts`

**Fix Applied:**
```typescript
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    secure: Number(process.env.SMTP_PORT) === 465, // ✅ Added this line
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
```

**Explanation:** Gmail SMTP on port 465 requires SSL/TLS (secure: true), while port 587 uses STARTTLS (secure: false). Without this flag, the connection may fail.

### 2. **Improved Error Handling in sendOtp**
**Problem:** No try-catch block or detailed error logging in the `sendOtp` function.

**Location:** `Server/org/apps/auth-service/src/utils/auth.helper.ts`

**Fix Applied:**
```typescript
export const sendOtp = async(email:string, name:string, template:string) => {
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        console.log(`Sending OTP to ${email} using template ${template}`);
        await sendMail(email, "Your OTP Code", template, {name, otp});
        console.log(`OTP sent successfully to ${email}`);
        await redis.set(`otp:${email}`, otp, 'EX', 10 * 60);
        await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 2 * 60);
    } catch (error) {
        console.error('Error in sendOtp:', error);
        throw new ValidationError("Failed to send OTP. Please check your email configuration.");
    }
}
```

## Configuration Verification

### SMTP Settings (Current)
```
SMTP_USER="cleverlyuse@gmail.com"
SMTP_PASS="dhno btcc cqmf bsxl"  // App password
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"                   // Secure SSL/TLS port
SMTP_SERVICE="Gmail"
```

### Redis Settings (Current)
```
REDIS_URL="rediss://default:AXp...@unbiased-squid-31305.upstash.io:6379"
```
✅ Using Upstash cloud Redis (no local Redis needed)

## How to Test the Fix

### 1. Restart the Server
```powershell
cd "c:\Users\Thimira Kodithuwakku\Documents\Cleverly-deployment\Cleverly---Final-Project\Server\org"
npm run dev
```

### 2. Test Reset Password Flow
1. Navigate to the Forgot Password page in your frontend
2. Enter a valid email address
3. Click "Send OTP" button
4. Check the console for logs:
   - ✅ `Sending OTP to {email} using template password-reset-mail`
   - ✅ `Email sent to {email}`
   - ✅ `OTP sent successfully to {email}`

### 3. Check for Errors
If you still see errors, check:

#### A. Gmail App Password
- Make sure you're using a Gmail App Password, not your regular Gmail password
- Generate at: https://myaccount.google.com/apppasswords
- Requires 2FA to be enabled

#### B. Redis Connection
- Check server console for: `✅ Connected to Redis successfully`
- If not connected, verify REDIS_URL in .env

#### C. Email Template
- Verify template exists: `Server/org/apps/auth-service/src/utils/sendMail/email-templates/password-reset-mail.ejs`

## Common Errors and Solutions

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** 
- Use Gmail App Password instead of regular password
- Enable 2FA on Gmail account first

### Error: "ETIMEDOUT" or "ECONNREFUSED"
**Solution:**
- Check if port 465 is blocked by firewall
- Try changing SMTP_PORT to 587 and the secure flag will automatically adjust

### Error: "Failed to send OTP"
**Solution:**
- Check server console for detailed error logs
- Verify all SMTP environment variables are set
- Test email configuration with a simple test script

### Error: "Too many OTP requests"
**Solution:**
- Redis rate limiting is active
- Wait for cooldown period (2 minutes)
- Check Redis for keys: `otp_requests:{email}`, `otp_cooldown:{email}`

## API Endpoints

### Send OTP (Forgot Password)
```
POST /forgot-password
Body: { email: "user@example.com" }
Response: { message: "OTP sent to email for verify your account" }
```

### Verify OTP
```
POST /verify-forgot-password-otp
Body: { email: "user@example.com", otp: "123456" }
Response: { success: true }
```

### Reset Password
```
POST /reset-password
Body: { email: "user@example.com", newPassword: "newpass123" }
Response: { message: "Password reset successfully" }
```

## Next Steps

1. **Restart your server** to apply the changes
2. **Test the forgot password flow** with a real email
3. **Monitor the console** for any error messages
4. **Check the error message** displayed in the frontend toast notification

If you continue to experience issues, please share:
- The exact error message from the frontend
- Server console logs when clicking "Send OTP"
- The response from the API (visible in browser DevTools > Network tab)

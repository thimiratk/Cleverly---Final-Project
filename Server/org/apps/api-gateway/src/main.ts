/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import ratelimit, { ipKeyGenerator } from 'express-rate-limit';
import cookieParser from "cookie-parser";
import proxy from 'express-http-proxy';


const app = express();

// Configure trust proxy more securely - trust only the first proxy
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL, 
  process.env.ADMIN_DASH,
  process.env.MOD_DASH,
  // Development URLs for dashboards
  'https://animated-space-umbrella-g4x9q94q5gv53p47-5175.app.github.dev', // Mod-dash dev server
  'https://animated-space-umbrella-g4x9q94q5gv53p47-5174.app.github.dev', // Admin-dash dev server
  'http://localhost:5175', // Local mod-dash
  'http://localhost:5174'  // Local admin-dash
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(morgan("dev"));
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({limit:"100mb", extended:true}));
app.use(cookieParser())

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:(req:any)=>(req.user ? 10000:5000), // Increased limits for development
  message:{error:"Too many requests, please try again later"},
  standardHeaders: true,
  legacyHeaders: true,
  // More secure key generation - don't rely on trust proxy for rate limiting
  keyGenerator: (req:any) => {
    // Use x-forwarded-for if available, otherwise fall back to req.ip
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.ip;
    return ipKeyGenerator(ip as string);
  },
})

app.use(limiter);


app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// Route review requests to review service
app.use("/api/reviews", proxy("http://localhost:6002", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Review service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route auth requests to auth service (login, register, verify, etc.)
app.use(["/api/login", "/api/register", "/api/verify", "/api/logout", "/api/refresh-token", "/api/auth", "/api/forgot-password", "/api/verify-forgot-password-otp", "/api/reset-password"], proxy("http://localhost:6001", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Auth service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route admin requests to auth service (admin panel functionality)
app.use(["/api/admin", "/api/users", "/api/moderators"], proxy("http://localhost:6001", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Admin service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route Google auth requests (without /api prefix since they come directly from Google)
app.use(["/auth/google", "/auth/google/callback", "/callback"], proxy("http://localhost:6001", {
  proxyReqPathResolver: (req) => {
    // If the request is just /callback, rewrite it to /auth/google/callback
    if (req.originalUrl === '/callback') {
      return '/auth/google/callback';
    }
    return req.originalUrl;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Google auth proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route domain management requests
app.use("/api/domain", proxy("http://localhost:6003", {
  proxyReqPathResolver: (req) => {
    // Don't remove /api - domain service expects /api/domain/*
    return req.originalUrl;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Domain management service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route user profile image uploads (multipart/form-data) - don't parse body
app.use(["/api/profile/me/profile-picture", "/api/profile/me/cover-picture"], proxy("http://localhost:6004", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // For multipart uploads, preserve the content-type
    if (srcReq.headers['content-type'] && srcReq.headers['content-type'].includes('multipart/form-data')) {
      proxyReqOpts.headers['content-type'] = srcReq.headers['content-type'];
    }
    return proxyReqOpts;
  },
  parseReqBody: false, // Don't parse body for file uploads
  proxyErrorHandler: (err, res, next) => {
    console.error('User profile image upload proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route other user profile requests (JSON data) - parse body normally
app.use("/api/profile", proxy("http://localhost:6004", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('User profile service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route user interactions requests (votes, comments, follows)
app.use(["/api/interactions", "/api/follows", "/api/comments"], proxy("http://localhost:6005", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('User interactions service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

// Graceful error handlers for uncaught exceptions / rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

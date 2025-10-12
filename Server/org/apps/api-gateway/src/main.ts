/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import ratelimit, { ipKeyGenerator } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import cookieParser from "cookie-parser";
import { error } from 'console';
import proxy from 'express-http-proxy';


const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_DASH];

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
  // Use the provided ipKeyGenerator helper to correctly handle IPv6 addresses
  keyGenerator: (req:any) => {
    // ipKeyGenerator expects an IP string and optional ipv6Subnet, so pass req.ip
    return ipKeyGenerator(req.ip as string);
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
app.use(["/api/login", "/api/register", "/api/verify", "/api/logout", "/api/refresh-token", "/api/auth"], proxy("http://localhost:6001", {
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
app.use(["/api/admin", "/api/users"], proxy("http://localhost:6001", {
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
app.use(["/api/domains", "/api/categories", "/api/subcategories"], proxy("http://localhost:6003", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('Domain management service proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway', details: err.message });
    }
  }
}));

// Route user profile requests
app.use("/api/profile", proxy("http://localhost:6004", {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace('/api', '');
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // For multipart uploads, preserve the content-type and don't parse the body
    if (srcReq.headers['content-type'] && srcReq.headers['content-type'].includes('multipart/form-data')) {
      proxyReqOpts.headers['content-type'] = srcReq.headers['content-type'];
    }
    return proxyReqOpts;
  },
  parseReqBody: false, // Don't parse body for file uploads
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

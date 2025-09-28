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

app.use(cors({
  origin:["https://animated-space-umbrella-g4x9q94q5gv53p47-5173.app.github.dev"],
  allowedHeaders:["Authorization", "Content-Type"],
  credentials: true,
}))

app.use(morgan("dev"));
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({limit:"100mb", extended:true}));
app.use(cookieParser())

const limiter = ratelimit({
  windowMs: 15*60*1000,
  max:(req:any)=>(req.user ? 1000:100),
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

// Proxy requests to the downstream service. Wrap proxy errors so they return 502
app.use("/", proxy("http://localhost:6001", {
  proxyErrorHandler: (err, res, next) => {
    console.error('Proxy error:', err);
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

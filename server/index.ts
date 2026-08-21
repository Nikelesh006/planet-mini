import "dotenv/config"; // Load .env variables FIRST

import express, { type Request, Response, NextFunction } from "express";

import { registerRoutes } from "./routes.js";

import { createServer } from "http";

import { connectDB } from "./db.js";

import cors from "cors";

import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken";

import passport from "passport";

export const app = express();

const httpServer = createServer(app);

app.set("trust proxy", 1);



declare module "http" {

  interface IncomingMessage {

    rawBody: unknown;

  }

}



app.use(

  express.json({

    verify: (req, _res, buf) => {

      req.rawBody = buf;

    },

  }),

);



app.use(express.urlencoded({ extended: false }));



// CORS + cookies

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5002",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://planet-mini.vercel.app",
  "https://planet-mini-api.vercel.app",
  "https://planet-mini-e4oc.vercel.app",
].filter(Boolean) as string[];

const isAllowedOrigin = (origin: string) => {
  if (configuredOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(cookieParser());



// Initialize passport

app.use(passport.initialize());

app.get("/api/health", async (_req: Request, res: Response) => {
  await connectDB();

  res.json({
    status: "ok",
    runtime: process.env.VERCEL ? "vercel" : "node",
    database: process.env.MONGODB_URI || process.env.DATABASE_URL ? "configured" : "missing",
  });
});





// Simple logger you already had

export function log(message: string, source = "express") {

  const formattedTime = new Date().toLocaleTimeString("en-US", {

    hour: "numeric",

    minute: "2-digit",

    second: "2-digit",

    hour12: true,

  });



  console.log(`${formattedTime} [${source}] ${message}`);

}



// API log middleware

app.use((req, res, next) => {

  const start = Date.now();

  const path = req.path;

  let capturedJsonResponse: Record<string, any> | undefined = undefined;



  const originalResJson = res.json;

  res.json = function (bodyJson, ...args) {

    capturedJsonResponse = bodyJson;

    return originalResJson.apply(res, [bodyJson, ...args]);

  };



  res.on("finish", () => {

    const duration = Date.now() - start;

    if (path.startsWith("/api")) {

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {

        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;

      }



      log(logLine);

    }

  });



  next();

});



// ---------- GOOGLE OAUTH ROUTES ----------



// GET /api/auth/google → redirect to Google OAuth

app.get("/api/auth/google", (req: Request, res: Response) => {

  const clientId = process.env.GOOGLE_CLIENT_ID as string;

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || "5001"}`;
  const redirectUri = encodeURIComponent(

    `${backendUrl}/api/auth/google/callback`,

  );

  const scope = encodeURIComponent("email profile");



  const googleAuthUrl =

    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +

    `&redirect_uri=${redirectUri}` +

    `&response_type=code` +

    `&scope=${scope}` +

    `&access_type=offline` +

    `&prompt=consent`;



  return res.redirect(googleAuthUrl);

});



// GET /api/auth/google/callback → exchange code, set JWT cookie, redirect home

app.get("/api/auth/google/callback", async (req: Request, res: Response) => {

  const code = req.query.code as string | undefined;

  if (!code) {

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5002";
    return res.redirect(`${frontendUrl}?error=missing_code`);

  }



  try {

    // Exchange code for tokens

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {

      method: "POST",

      headers: { "Content-Type": "application/x-www-form-urlencoded" },

      body: new URLSearchParams({

        client_id: process.env.GOOGLE_CLIENT_ID as string,

        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,

        code,

        grant_type: "authorization_code",

        redirect_uri: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || "5001"}`}/api/auth/google/callback`,

      }),

    });



    const tokenJson = await tokenRes.json() as any;

    if (tokenJson.error) {

      console.error("Google token error:", tokenJson.error);

      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5002"}?error=token_error`);

    }



    // Get user info

    const userRes = await fetch(

      "https://www.googleapis.com/oauth2/v2/userinfo",

      {

        headers: {

          Authorization: `Bearer ${tokenJson.access_token}`,

        },

      },

    );

    const user = await userRes.json() as any;



    // Create our own JWT

    const payload = {

      id: user.id || `google-${user.email}`,

      email: user.email,

      name: user.name || user.given_name,

      avatar: user.picture,

    };



    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET as string, {

      expiresIn: "24h",

    });



    const isProduction = process.env.NODE_ENV === "production";

    // Localhost runs over HTTP, so secure cross-site cookies are ignored by the browser.
    console.log(
      `Setting JWT cookie with secure: ${isProduction}, sameSite: ${isProduction ? "none" : "lax"}`,
    );
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });



    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5002"}/?token=${jwtToken}`);

  } catch (err) {

    console.error("Google callback error:", err);

    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5002"}?error=auth_failed`);

  }

});



// GET /api/auth/session → verify JWT and return user

app.get("/api/auth/session", (req: Request, res: Response) => {
  console.log("🔍 /api/auth/session - Cookies:", req.cookies);
  console.log("🔍 /api/auth/session - Headers:", req.headers.cookie);
  
  // Accept token from cookie or Authorization header
  let token = req.cookies?.jwt;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    console.log("❌ /api/auth/session - No JWT token found in cookies or headers");
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return res.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        image: decoded.avatar,
      },
    });
  } catch (err) {
    res.clearCookie("jwt");
    return res.status(401).json({ user: null });
  }
});



// POST /api/auth/logout → clear cookie

app.post("/api/auth/logout", (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";

  console.log(
    `Clearing JWT cookie with secure: ${isProduction}, sameSite: ${isProduction ? "none" : "lax"}`,
  );
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ success: true });

});



// ---------- EXISTING BOOTSTRAP FLOW ----------





async function bootstrap() {
  await registerRoutes(httpServer, app);

  await connectDB();

  // Initialize WhatsApp client for order notifications
  if (process.env.OWNER_WHATSAPP_NUMBER) {
    console.log('📱 Initializing WhatsApp client for order notifications...');
    try {
      const { initializeWhatsAppClient } = await import('./services/whatsappClient.js');
      initializeWhatsAppClient();
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
      console.log('WhatsApp notifications will be disabled. Server will continue running.');
    }
  } else {
    console.log('⚠️ OWNER_WHATSAPP_NUMBER not set. WhatsApp notifications disabled.');
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {

    const status = err.status || err.statusCode || 500;

    const message = err.message || "Internal Server Error";



    console.error("Internal Server Error:", err);



    if (res.headersSent) {

      return next(err);

    }



    return res.status(status).json({ message });

  });



  if (process.env.VERCEL) {

    log("running as a Vercel function");

  }



  // (You already call connectDB above; this second call is redundant, but left as-is per your code)

  await connectDB();



  if (!process.env.VERCEL) {

    const port = parseInt(process.env.PORT || "5001", 10);

    httpServer.listen(

      {

        port,

        host: "0.0.0.0",

      },

      () => {

        log(`serving on port ${port}`);

      },

    );

  }

}

export const ready = bootstrap();

export default app;


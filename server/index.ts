import "dotenv/config"; // Load .env variables FIRST

import express, { type Request, Response, NextFunction } from "express";

import { registerRoutes } from "./routes";

import { serveStatic } from "./static";

import { createServer } from "http";

import dotenv from "dotenv";

import { connectDB } from "./db";

import cors from "cors";

import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken";

import passport from "passport";



dotenv.config();



const app = express();

const httpServer = createServer(app);



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

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5002";

app.use(cors({ origin: frontendUrl, credentials: true }));

app.use(cookieParser());



// Initialize passport

app.use(passport.initialize());





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

  const redirectUri = encodeURIComponent(

    `${frontendUrl}/api/auth/google/callback`,

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

        redirect_uri: `${frontendUrl}/api/auth/google/callback`,

      }),

    });



    const tokenJson = await tokenRes.json();

    if (tokenJson.error) {

      console.error("Google token error:", tokenJson.error);

      return res.redirect(`${frontendUrl}?error=token_error`);

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

    const user = await userRes.json();



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



    // Set cookie

    res.cookie("jwt", jwtToken, {

      httpOnly: true,

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000,

    });



    return res.redirect(`${frontendUrl}/`);

  } catch (err) {

    console.error("Google callback error:", err);

    return res.redirect(`${frontendUrl}?error=auth_failed`);

  }

});



// GET /api/auth/session → verify JWT and return user

app.get("/api/auth/session", (req: Request, res: Response) => {

  const token = req.cookies?.jwt;

  if (!token) {

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

  res.clearCookie("jwt");

  return res.json({ success: true });

});



// ---------- EXISTING BOOTSTRAP FLOW ----------

let isInitialized = false;

export const initApp = async () => {
  if (isInitialized) return app;
  
  await registerRoutes(httpServer, app);
  await connectDB();

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  } else if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  isInitialized = true;
  return app;
};

if (!process.env.VERCEL) {
  initApp().then(() => {
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
  });
}

// For Vercel serverless deployment
export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;

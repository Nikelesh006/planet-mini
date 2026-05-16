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



// ---------- ROOT ROUTE FOR HEALTHCHECK ----------

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ---------- GOOGLE OAUTH ROUTES ARE NOW HANDLED IN server/routes/auth.ts ----------


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

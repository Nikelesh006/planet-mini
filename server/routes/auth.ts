import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT Strategy for protected routes - FIXED: Properly extract from cookies
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req: any) => {
      // Get token from regular cookie
      const token = req.cookies?.auth_token;
      console.log('🔍 JWT Extractor - Cookie token:', token ? 'Found' : 'Not found');
      return token || null;
    },
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(jwtOpts, (payload: any, done: any) => {
    console.log('JWT Strategy - Payload:', payload);
    // Return the user payload from JWT
    return done(null, payload);
  })
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          name: profile.displayName,
          picture: profile.photos?.[0]?.value || "",
        };
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Serialize/deserialize user
passport.serializeUser((user: any, done: any) => done(null, user.id));
passport.deserializeUser((id: string, done: any) => {
  done(null, { id });
});

// Google Auth Routes
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req: any, res: any) => {
    const user = req.user as any;
    console.log('🔥 Google callback - User:', user);
    
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Set httpOnly JWT cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });
    
    console.log('✅ Google callback - Token set, redirecting to /');

    // Redirect to home - navbar will see cookie via AuthContext
    res.redirect("/");
  }
);

// Get current user - with better error handling
router.get("/me", 
  passport.authenticate("jwt", { session: false }),
  (req: any, res: any) => {
    console.log('/api/auth/me - User:', req.user);
    res.json(req.user);
  }
);

// Logout
router.post("/logout", (req: any, res: any) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

export default router;

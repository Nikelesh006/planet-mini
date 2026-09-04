import { rateLimit } from 'express-rate-limit';

/**
 * Global API rate limiter for general browsing and queries.
 * Generous threshold (500 requests / 15 mins) to never disrupt legitimate shoppers.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Authentication rate limiter for signin/signup.
 * 15 attempts / 15 mins per IP to stop credential stuffing and brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login or registration attempts. Please try again after 15 minutes.',
  },
});

/**
 * Payment creation rate limiter.
 * 25 order creations / 15 mins per IP to prevent spamming payment gateway orders.
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many payment requests initiated. Please wait a few moments before trying again.',
  },
});

/**
 * Spin wheel rate limiter.
 * 20 spins / registrations / 15 mins per IP to stop bot manipulation.
 */
export const spinWheelLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many spin wheel requests. Please try again later.',
  },
});

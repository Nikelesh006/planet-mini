import express from 'express';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs';

import Profile from '../models/Profile.js';

import { authLimiter } from '../lib/rateLimiters.js';

const router = express.Router();

router.post('/signup', authLimiter, async (req: express.Request, res: express.Response) => {

  try {

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {

      return res.status(400).json({ error: 'Name, email, and password are required' });

    }

    const emailLower = String(email).toLowerCase();

    const existing = await Profile.findOne({ email: emailLower });

    if (existing) {

      return res.status(400).json({ error: 'Email already registered' });

    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const userId = `local-${emailLower}`;

    const nameParts = String(firstName).trim().split(' ');

    const fName = nameParts[0] || '';

    const lName = lastName ? String(lastName).trim() : nameParts.slice(1).join(' ') || '';

    const profile = await Profile.findOneAndUpdate(

      { userId },

      {

        userId,

        firstName: fName,

        lastName: lName,

        email: emailLower,

        password: hashedPassword,

        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      },

      { upsert: true, new: true }

    );

    const payload = {

      id: profile.userId,

      email: profile.email,

      name: `${profile.firstName} ${profile.lastName || ''}`.trim(),

      avatar: profile.image || null,

    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {

      expiresIn: '24h',

    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {

      httpOnly: true,

      secure: isProduction,

      sameSite: isProduction ? 'none' : 'lax',

      maxAge: 24 * 60 * 60 * 1000,

    });

    return res.status(201).json({ token, user: payload });

  } catch (error) {

    console.error('Signup error:', error);

    return res.status(500).json({ error: 'Signup failed' });

  }

});

router.post('/signin', authLimiter, async (req: express.Request, res: express.Response) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({ error: 'Email and password are required' });

    }

    const emailLower = String(email).toLowerCase();

    const profile = await Profile.findOne({ email: emailLower });

    if (!profile || !profile.password) {

      return res.status(401).json({ error: 'Invalid credentials' });

    }

    const isValid = await bcrypt.compare(String(password), profile.password);

    if (!isValid) {

      return res.status(401).json({ error: 'Invalid credentials' });

    }

    const payload = {

      id: profile.userId,

      email: profile.email,

      name: `${profile.firstName} ${profile.lastName || ''}`.trim(),

      avatar: profile.image || null,

    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {

      expiresIn: '24h',

    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {

      httpOnly: true,

      secure: isProduction,

      sameSite: isProduction ? 'none' : 'lax',

      maxAge: 24 * 60 * 60 * 1000,

    });

    return res.json({ token, user: payload });

  } catch (error) {

    console.error('Signin error:', error);

    return res.status(500).json({ error: 'Signin failed' });

  }

});

export default router;

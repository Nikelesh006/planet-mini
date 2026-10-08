import express, { type Request, type Response } from 'express';
import axios from 'axios';
import WhatsAppCredential from '../models/WhatsAppCredential.js';

const router = express.Router();

/** Safely mask a token for logging: show first 6 chars only */
function maskToken(token: string): string {
  if (!token || token.length < 10) return '***';
  return token.substring(0, 6) + '...[redacted]';
}

/**
 * POST /api/whatsapp/exchange
 *
 * Receives the authorization code + session info from the frontend,
 * exchanges the code at Meta's OAuth endpoint for a business access token,
 * and persists the credentials in MongoDB.
 *
 * Body: { code: string, sessionInfo?: { waba_id?: string, phone_number_id?: string } }
 */
const handleExchange = async (req: Request, res: Response) => {
  const code = (req.query.code as string) || req.body?.code;
  const sessionInfo = req.body?.sessionInfo || {};

  // ── Validate inputs ──────────────────────────────────────────
  if (!code || typeof code !== 'string') {
    console.error('[WhatsAppOAuth] ❌ Missing or invalid authorization code in request body.');
    return res.status(400).json({
      success: false,
      error: 'Missing authorization code. Send { code: "..." } in the request body.',
    });
  }

  const wabaId = sessionInfo?.waba_id;
  const phoneNumberId = sessionInfo?.phone_number_id;

  if (!wabaId || !phoneNumberId) {
    console.warn(
      '[WhatsAppOAuth] ⚠️ Session info incomplete — waba_id or phone_number_id missing.',
      { wabaId: wabaId || '(missing)', phoneNumberId: phoneNumberId || '(missing)' }
    );
    // Don't hard-fail: the code exchange can still work, but we won't be able to save full creds.
  }

  // ── Resolve secrets from env ─────────────────────────────────
  const clientId =
    process.env.META_APP_ID ||
    process.env.WHATSAPP_APP_ID ||
    '1640886047680153';

  const clientSecret =
    process.env.META_APP_SECRET ||
    process.env.WHATSAPP_APP_SECRET;

  if (!clientSecret) {
    console.error('[WhatsAppOAuth] ❌ META_APP_SECRET is not set in the server .env file.');
    return res.status(500).json({
      success: false,
      error: 'Server misconfiguration: META_APP_SECRET is missing.',
    });
  }

  // ── Exchange the code (expires in ~30 seconds) ───────────────
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;

  console.log(`[WhatsAppOAuth] 🔄 Exchanging code ${maskToken(code)} at ${tokenUrl} ...`);

  try {
    const tokenRes = await axios.get(tokenUrl, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        // No redirect_uri — not needed for server-side Embedded Signup exchange
      },
    });

    const { access_token, token_type, expires_in } = tokenRes.data;

    if (!access_token) {
      console.error('[WhatsAppOAuth] ❌ Meta returned success but no access_token.', tokenRes.data);
      return res.status(502).json({ success: false, error: 'Meta returned no access_token.' });
    }

    console.log(
      `[WhatsAppOAuth] ✅ Code exchanged → token ${maskToken(access_token)}, ` +
      `type=${token_type || 'bearer'}, expires_in=${expires_in ?? 'never'}`
    );

    // ── Persist to MongoDB ───────────────────────────────────────
    if (wabaId && phoneNumberId) {
      try {
        await WhatsAppCredential.findOneAndUpdate(
          { wabaId, phoneNumberId },
          {
            wabaId,
            phoneNumberId,
            accessTokenEncrypted: access_token, // TODO: encrypt before storing in production
            tokenType: token_type || 'bearer',
            expiresIn: expires_in ?? 0,
          },
          { upsert: true, new: true }
        );
        console.log(
          `[WhatsAppOAuth] 💾 Saved credentials for WABA=${wabaId}, Phone=${phoneNumberId}`
        );
      } catch (dbErr: any) {
        console.error('[WhatsAppOAuth] ⚠️ Failed to save credentials to DB:', dbErr.message);
        // Don't fail the whole response — token exchange succeeded
      }
    }

    // ── Return (without leaking the full token) ──────────────────
    return res.json({
      success: true,
      token_preview: maskToken(access_token),
      token_type: token_type || 'bearer',
      expires_in: expires_in ?? 0,
      waba_id: wabaId || null,
      phone_number_id: phoneNumberId || null,
      // The frontend does NOT need the full token — it's stored server-side.
    });
  } catch (err: any) {
    const errData = err.response?.data || err.message;
    console.error('[WhatsAppOAuth] ❌ Code exchange failed:', errData);
    return res.status(err.response?.status || 502).json({
      success: false,
      error: errData,
    });
  }
});

router.post('/api/whatsapp/exchange', handleExchange);
router.get('/api/whatsapp/exchange', handleExchange);
router.post('/exchange-token', handleExchange);
router.get('/exchange-token', handleExchange);

export default router;

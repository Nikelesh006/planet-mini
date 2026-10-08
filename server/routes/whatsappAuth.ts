import express, { type Request, type Response } from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Endpoint to exchange WhatsApp Embedded Signup code for a User/System Access Token
 * GET /exchange-token?code=...
 * POST /exchange-token (body: { code: '...' })
 */
const handleTokenExchange = async (req: Request, res: Response) => {
  const code = (req.query.code as string) || req.body?.code;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Missing authorization code. Provide ?code=... or { code: "..." } in body.',
    });
  }

  const clientId =
    process.env.WHATSAPP_APP_ID ||
    process.env.META_APP_ID ||
    '1640886047680153';

  const clientSecret =
    process.env.WHATSAPP_APP_SECRET ||
    process.env.META_APP_SECRET;

  if (!clientSecret) {
    return res.status(500).json({
      success: false,
      error: 'META_APP_SECRET or WHATSAPP_APP_SECRET is not set in backend .env file.',
    });
  }

  try {
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v25.0';
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;

    console.log(`[WhatsAppOAuth] Exchanging authorization code via ${tokenUrl}...`);

    const response = await axios.get(tokenUrl, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      },
    });

    const tokenData = response.data;
    console.log('[WhatsAppOAuth] ✅ Code exchanged successfully!');

    return res.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
    });
  } catch (error: any) {
    const errorDetails = error.response?.data || error.message;
    console.error('[WhatsAppOAuth] ❌ Failed to exchange code:', errorDetails);

    return res.status(error.response?.status || 500).json({
      success: false,
      error: errorDetails,
    });
  }
};

router.get('/exchange-token', handleTokenExchange);
router.post('/exchange-token', handleTokenExchange);
router.get('/api/whatsapp/exchange-token', handleTokenExchange);
router.post('/api/whatsapp/exchange-token', handleTokenExchange);

export default router;

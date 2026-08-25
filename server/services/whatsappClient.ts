import whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsapp;
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';

let whatsappClient: any = null;
let isClientReady = false;

// Graceful cleanup handler
const cleanup = async () => {
  if (whatsappClient) {
    console.log('📱 Shutting down WhatsApp client browser instance...');
    try {
      isClientReady = false;
      await whatsappClient.destroy();
      console.log('📱 WhatsApp client browser closed successfully.');
    } catch (err) {
      console.error('Failed to close WhatsApp client browser on shutdown:', err);
    }
    whatsappClient = null;
  }
};

// Register shutdown handlers
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

export function initializeWhatsAppClient(): any {
  // Gracefully skip on Vercel serverless environment
  if (process.env.VERCEL) {
    console.log('⚠️ WhatsApp client initialization skipped - running in Vercel serverless environment');
    return null;
  }

  if (whatsappClient) {
    console.log('WhatsApp client already initialized');
    return whatsappClient;
  }

  console.log('Initializing WhatsApp client...');

  // Use a persistent folder outside the build directory
  const authPath = process.env.WHATSAPP_AUTH_PATH || path.join(process.cwd(), '.wwebjs_auth');
  console.log(`WhatsApp Auth Session Directory: ${authPath}`);

  const launchOptions: any = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ],
    timeout: 60000,
  };

  // Auto-detect Chromium path in Linux containers (e.g. Railway, Render, VPS)
  if (process.platform === 'linux') {
    const possiblePaths = [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/snap/bin/chromium'
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        launchOptions.executablePath = p;
        console.log(`📱 Found system Chromium executable at: ${p}`);
        break;
      }
    }
  }

  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: authPath,
        clientId: 'planet-mini-whatsapp'
      }),
      puppeteer: launchOptions,
    });

    whatsappClient.on('qr', (qr: any) => {
      console.log('QR Code received. Scan this with WhatsApp to authenticate:');
      try {
        qrcode.generate(qr, { small: true });
      } catch (err) {
        console.error('Failed to display QR code in terminal:', err);
      }
    });

    whatsappClient.on('ready', () => {
      console.log('🎉 WhatsApp client is ready and connected!');
      isClientReady = true;
    });

    whatsappClient.on('authenticated', () => {
      console.log('WhatsApp client authenticated successfully!');
    });

    whatsappClient.on('auth_failure', async (msg: any) => {
      console.error('❌ WhatsApp authentication failure:', msg);
      isClientReady = false;
      // Delete local session to trigger new QR code on next startup
      try {
        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log('Cleared invalid WhatsApp session directory to allow re-authentication.');
        }
      } catch (err) {
        console.error('Failed to delete invalid session directory:', err);
      }
    });

    whatsappClient.on('disconnected', async (reason: any) => {
      console.log('📱 WhatsApp client disconnected:', reason);
      isClientReady = false;
      
      try {
        await whatsappClient.destroy();
      } catch (destroyErr) {
        console.error('Error destroying client on disconnect:', destroyErr);
      }
      
      whatsappClient = null;
      console.log('Attempting to reinitialize WhatsApp client in 10s...');
      setTimeout(() => {
        initializeWhatsAppClient();
      }, 10000);
    });

    whatsappClient.initialize().catch((error: any) => {
      console.error('Failed to initialize WhatsApp client:', error);
      isClientReady = false;
      whatsappClient = null;
    });

    return whatsappClient;
  } catch (error) {
    console.error('Exception during WhatsApp client setup:', error);
    isClientReady = false;
    whatsappClient = null;
    return null;
  }
}

export function getWhatsAppClient(): any {
  return whatsappClient;
}

export function isWhatsAppClientReady(): boolean {
  return isClientReady;
}

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  // Gracefully skip on Vercel
  if (process.env.VERCEL) {
    console.log('⚠️ Running on Vercel - Skipping WhatsApp notification send (requires active client)');
    return;
  }

  const client = getWhatsAppClient();
  
  if (!client) {
    console.warn('⚠️ WhatsApp client is not initialized. Cannot send message.');
    return;
  }

  if (!isClientReady) {
    console.warn('⚠️ WhatsApp client is initialized but not yet in READY state. Skipping message.');
    return;
  }

  try {
    // Format phone number: remove non-digits
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Auto-prepend country code '91' for Indian mobile numbers if 10 digits
    if (cleanNumber.length === 10 && /^[6789]/.test(cleanNumber)) {
      cleanNumber = '91' + cleanNumber;
    }

    let formattedNumber = `${cleanNumber}@c.us`;

    // Attempt to verify registered number via API for accuracy
    try {
      const numberDetails = await client.getNumberId(cleanNumber);
      if (numberDetails && numberDetails._serialized) {
        formattedNumber = numberDetails._serialized;
        console.log(`📱 Resolved registered WhatsApp WID: ${formattedNumber}`);
      } else {
        console.warn(`⚠️ Number ${cleanNumber} does not appear to be registered on WhatsApp. Attempting send to standard address.`);
      }
    } catch (verifError) {
      console.error('Failed to verify number ID, falling back to standard format:', verifError);
    }

    console.log(`Sending WhatsApp message to ${formattedNumber}...`);
    await client.sendMessage(formattedNumber, message);
    console.log('✅ WhatsApp message sent successfully');
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
  }
}

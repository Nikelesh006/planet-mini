import whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsapp;
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';

let whatsappClient: any = null;

export function initializeWhatsAppClient(): any {
  if (whatsappClient) {
    console.log('WhatsApp client already initialized');
    return whatsappClient;
  }

  console.log('Initializing WhatsApp client...');

  // Get absolute path for session data
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const authPath = path.join(__dirname, '.wwebjs_auth');

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: authPath,
      clientId: 'planet-mini-whatsapp'
    }),
    puppeteer: {
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
    },
  });

  whatsappClient.on('qr', (qr: any) => {
    console.log('QR Code received. Scan this with WhatsApp to authenticate:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready and connected!');
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated successfully!');
  });

  whatsappClient.on('auth_failure', (msg: any) => {
    console.error('WhatsApp authentication failure:', msg);
  });

  whatsappClient.on('disconnected', (reason: any) => {
    console.log('WhatsApp client disconnected:', reason);
    console.log('Attempting to reinitialize WhatsApp client...');
    whatsappClient = null;
    setTimeout(() => {
      initializeWhatsAppClient();
    }, 10000);
  });

  whatsappClient.initialize().catch((error: any) => {
    console.error('Failed to initialize WhatsApp client:', error);
    console.log('WhatsApp notifications will be disabled. Server will continue running.');
  });

  return whatsappClient;
}

export function getWhatsAppClient(): any {
  return whatsappClient;
}

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  const client = getWhatsAppClient();
  
  if (!client) {
    console.error('WhatsApp client is not initialized');
    return;
  }

  try {
    // Format phone number: remove any non-digit characters and ensure it has country code
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = `${cleanNumber}@c.us`;

    console.log(`Sending WhatsApp message to ${formattedNumber}`);
    
    await client.sendMessage(formattedNumber, message);
    console.log('WhatsApp message sent successfully');
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    // Don't throw - we don't want notification failures to break the application
  }
}

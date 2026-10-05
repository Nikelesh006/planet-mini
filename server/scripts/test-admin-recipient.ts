import 'dotenv/config';
import axios from 'axios';

async function testSendAdmin() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = '1304438766094033'; // Real number (+91 81244 11259)
  const recipient = '918220294678';

  console.log(`Testing dispatch to ${recipient} from sender ID ${phoneId}...`);

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: 'admin_alert',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'ORD-TEST-8220' },
                { type: 'text', text: '9597755722' },
                { type: 'text', text: 'Paid INR 1499 via Razorpay' },
                { type: 'text', text: '14 Gandhi Road, Chennai, 600040' },
                { type: 'text', text: 'https://planetmini.in/shop' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Result:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('Error sending:', JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

testSendAdmin();

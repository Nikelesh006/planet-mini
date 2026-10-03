import 'dotenv/config';
import axios from 'axios';

async function testSendAdmin() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = '1313164441886346'; // Test number (+1 555-140-3536)
  const recipient = '918124411259';

  console.log(`Testing dispatch to ${recipient} from sender ID ${phoneId}...`);

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
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

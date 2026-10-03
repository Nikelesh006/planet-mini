import 'dotenv/config';
import axios from 'axios';

async function debugWabas() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaIds = [
    '1468601485088558',
    '1000209395756000',
    '1413437806861887',
    '1768045731101614'
  ];

  for (const wabaId of wabaIds) {
    console.log(`\nFetching phone numbers for WABA: ${wabaId}...`);
    try {
      const res = await axios.get(
        `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`✅ Numbers for WABA ${wabaId}:`, JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.log(`❌ WABA ${wabaId}:`, err.response?.data?.error?.message || err.message);
    }
  }
}

debugWabas();

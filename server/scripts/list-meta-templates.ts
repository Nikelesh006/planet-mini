import 'dotenv/config';
import axios from 'axios';

async function listTemplates() {
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1768045731101614';
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!token) {
    console.error('No WHATSAPP_ACCESS_TOKEN found');
    process.exit(1);
  }

  try {
    const res = await axios.get(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 100
        }
      }
    );

    console.log('Registered Templates in Meta WABA:');
    const templates = res.data?.data || [];
    if (templates.length === 0) {
      console.log('No templates found in this WhatsApp Business Account.');
    } else {
      templates.forEach((t: any) => {
        console.log(`- Name: "${t.name}" | Status: ${t.status} | Language: "${t.language}" | Category: ${t.category}`);
      });
    }
  } catch (err: any) {
    console.error('Error fetching templates:', err.response?.data || err.message);
  }
}

listTemplates();

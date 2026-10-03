import 'dotenv/config';
import axios from 'axios';

async function checkTemplateDetails() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = '1413437806861887';

  try {
    const res = await axios.get(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const templates = res.data?.data || [];
    for (const t of templates) {
      console.log(`\n================================`);
      console.log(`Template: ${t.name} (${t.language}) [${t.status}]`);
      for (const c of t.components || []) {
        console.log(`Component ${c.type}:`);
        if (c.text) console.log(`  Text: "${c.text}"`);
        if (c.example) console.log(`  Example:`, JSON.stringify(c.example));
      }
    }
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

checkTemplateDetails();

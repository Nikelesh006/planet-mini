import 'dotenv/config';
import axios from 'axios';

async function diagnose() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '2545263782581454';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1369820972878161';

  console.log('--- 1. Checking Token & Debug Info ---');
  try {
    const debugRes = await axios.get(
      `https://graph.facebook.com/v21.0/debug_token?input_token=${token}&access_token=${token}`
    );
    console.log('Token Scopes:', debugRes.data?.data?.scopes);
    console.log('Token App ID:', debugRes.data?.data?.app_id);
    console.log('Token Expires At:', debugRes.data?.data?.data_access_expires_at || debugRes.data?.data?.expires_at);
    console.log('Token Is Valid:', debugRes.data?.data?.is_valid);
  } catch (err: any) {
    console.log('Debug token info error:', err.response?.data || err.message);
  }

  console.log('\n--- 2. Checking WABA Details ---');
  try {
    const wabaRes = await axios.get(
      `https://graph.facebook.com/v21.0/${wabaId}?fields=id,name,currency,timezone_id,message_template_namespace,account_review_status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('WABA Data:', wabaRes.data);
  } catch (err: any) {
    console.log('WABA fetch error:', err.response?.data || err.message);
  }

  console.log('\n--- 3. Checking Phone Number Details ---');
  try {
    const phoneRes = await axios.get(
      `https://graph.facebook.com/v21.0/${phoneId}?fields=id,verified_name,code_verification_status,display_phone_number,quality_rating,platform_type,throughput`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Phone Number Data:', phoneRes.data);
  } catch (err: any) {
    console.log('Phone fetch error:', err.response?.data || err.message);
  }

  console.log('\n--- 4. Checking Existing Templates ---');
  try {
    const tmplRes = await axios.get(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tmpls = tmplRes.data?.data || [];
    console.log(`Found ${tmpls.length} templates:`, tmpls.map((t: any) => `${t.name} (${t.status})`));
  } catch (err: any) {
    console.log('Templates fetch error:', err.response?.data || err.message);
  }
}

diagnose();

import 'dotenv/config';
import axios from 'axios';

async function createTemplates() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '2545263782581454';

  console.log('Attempting to create admin_alert template...');
  try {
    const res1 = await axios.post(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
      {
        name: 'admin_alert',
        category: 'UTILITY',
        language: 'en',
        components: [
          {
            type: 'BODY',
            text: 'New order received! Order ID: {{1}}, Customer: {{2}}, Total: {{3}}. Please check the admin portal.',
            example: {
              body_text: [['ORD_1001', 'John Doe', 'Rs 999']]
            }
          }
        ]
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('admin_alert created successfully:', res1.data);
  } catch (err: any) {
    console.error('admin_alert creation error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }

  console.log('\nAttempting to create customer_order_confirmation template...');
  try {
    const res2 = await axios.post(
      `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
      {
        name: 'customer_order_confirmation',
        category: 'UTILITY',
        language: 'en',
        components: [
          {
            type: 'BODY',
            text: 'Hi {{1}}, thank you for your order! Your order ID is {{2}} for a total amount of {{3}}. We are processing it right now!',
            example: {
              body_text: [['John Doe', 'ORD_1001', 'Rs 999']]
            }
          }
        ]
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('customer_order_confirmation created successfully:', res2.data);
  } catch (err: any) {
    console.error('customer_order_confirmation creation error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

createTemplates();

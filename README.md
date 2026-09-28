# Planet Mini

An e-commerce platform for baby products with React frontend and Node.js backend.

## Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your values

# Start development servers
npm run dev
```

### Environment Variables

See `server/.env.example` for required environment variables including:
- MongoDB connection string
- Google OAuth credentials
- Razorpay API keys
- Cloudinary credentials
- WhatsApp owner number (for notifications)

## WhatsApp Notifications & Razorpay Webhooks

Planet Mini automatically dispatches two Meta WhatsApp Cloud API template notifications upon successful payment:
1. **Admin Order Alert** (`admin_order_alert`): Sent to `ADMIN_WHATSAPP_NUMBER` with order ID, joined items details, payment status (in INR), delivery address, and product link.
2. **Customer Order Confirmation** (`order_confirmation_customer`): Sent to the customer's phone number on the delivery address with customer name and order ID.

### Required Environment Variables

```env
# Razorpay Configuration & Webhook Secret
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Meta WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_permanent_system_user_access_token
WHATSAPP_API_VERSION=v21.0
ADMIN_WHATSAPP_NUMBER=919597755722
WHATSAPP_ADMIN_TEMPLATE=admin_order_alert
WHATSAPP_CUSTOMER_TEMPLATE=order_confirmation_customer
FRONTEND_URL=https://www.planetmini.in
```

### Razorpay Dashboard Webhook Configuration

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** → **Webhooks**.
3. Click **Add New Webhook**:
   - **Webhook URL**: `https://<YOUR_API_DOMAIN>/api/webhooks/razorpay`
   - **Secret**: Enter the exact secret configured in `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events**: Select:
     - `payment.captured`
     - `order.paid`
4. Click **Save Webhook**.

### Testing Webhooks Locally with ngrok

1. Start your local backend (runs on port `5002` by default):
   ```bash
   npm run dev
   ```
2. In a separate terminal, expose your local server with ngrok:
   ```bash
   ngrok http 5002
   ```
3. Copy the forwarding HTTPS URL (e.g. `https://abc1234.ngrok-free.app`).
4. Set the webhook URL in Razorpay Dashboard to:
   `https://abc1234.ngrok-free.app/api/webhooks/razorpay`
5. Test a payment or send a test webhook from the Razorpay dashboard!

### Testing WhatsApp Templates Directly

Run the included test script to verify both template notifications:
```bash
npx tsx server/scripts/test-whatsapp-templates.ts
```

### Admin Manual Resend Endpoint

Admins can manually resend WhatsApp notifications for an order if needed:
- **Route**: `POST /api/admin/orders/:id/resend-whatsapp`
- **Headers**: Authorization token with admin privileges
- **Body**: `{ "type": "both" }` (`"admin"` | `"customer"` | `"both"`)

## Project Structure

```
planet-mini/
├── client/          # React frontend
├── server/          # Node.js backend
│   ├── services/    # WhatsApp client, etc.
│   ├── utils/       # Notification utilities
│   ├── routes/      # API routes
│   └── models/      # Database models
└── shared/          # Shared TypeScript types
```

## License

MIT

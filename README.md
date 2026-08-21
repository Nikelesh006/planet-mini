# Planet Mini

An e-commerce platform for baby products with React frontend and Node.js backend.

## WhatsApp Integration

This application uses WhatsApp Web.js for sending order notifications to the store owner. **Important notes about this integration:**

### ⚠️ Important Warnings

- **Unofficial Library**: This integration uses `whatsapp-web.js`, which is an unofficial library not affiliated with WhatsApp/Meta. Use at your own risk.

- **Ban Risk**: WhatsApp may ban numbers that use automation tools. We strongly recommend using a **secondary WhatsApp number** for notifications, not your primary business number.

- **Server Requirements**: This integration requires a **persistently running server/process**. It will not work well on serverless platforms (like Vercel) because the WhatsApp session needs to remain active. Consider using a VPS, Railway, Render, or similar always-on hosting.

- **QR Code Authentication**: On first run, you'll need to scan a QR code displayed in the server terminal to authenticate the WhatsApp number. The session data is persisted in the `.wwebjs_auth` folder.

### Setup Instructions

1. **Set Environment Variable**:
   ```bash
   # In server/.env
   OWNER_WHATSAPP_NUMBER=91XXXXXXXXXX
   ```
   Replace `91XXXXXXXXXX` with your phone number including country code (e.g., `91` for India).

2. **Start the Server**:
   ```bash
   cd server
   npm run dev
   ```

3. **Scan QR Code**:
   - On first startup, a QR code will be displayed in the terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code displayed in the terminal

4. **Session Persistence**:
   - After successful authentication, session data is saved in `.wwebjs_auth/`
   - Subsequent server restarts will automatically reconnect without requiring re-authentication
   - This folder is gitignored for security

### How It Works

When a customer successfully completes payment via Razorpay:
1. The order is created in the database
2. A WhatsApp message is automatically sent to the owner's number with:
   - Order ID
   - Product details (names, quantities, prices)
   - Total amount paid
   - Shipping address
   - Customer name and phone number

### Troubleshooting

- **QR Code not showing**: Check that `OWNER_WHATSAPP_NUMBER` is set in `.env`
- **Authentication failing**: Ensure you're scanning the QR code within the time limit shown in terminal
- **Messages not sending**: Check server logs for errors, ensure WhatsApp client is connected
- **Session lost**: Delete the `.wwebjs_auth` folder and restart the server to re-authenticate

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

# Planetmini WhatsApp Cloud API & WooCommerce Admin Alerts

Official WordPress Plugin for **planetmini.in** implementing WhatsApp Embedded Signup v4 (Graph API v26.0) and automated WooCommerce admin order alerts.

---

## 🎯 Features

1. **WhatsApp Embedded Signup v4 (Graph API v26.0)**:
   - Modern popup onboarding using Facebook JavaScript SDK.
   - Captures `waba_id`, `phone_number_id`, and `business_id`.
   - Exchanging authorization code directly through `/wp-json/planetmini/v1/whatsapp/exchange`.
2. **Automated WooCommerce Admin Alerts**:
   - Hooks into `woocommerce_new_order`, `woocommerce_thankyou`, and `woocommerce_order_status_processing`.
   - Automatically checks or creates the Meta-approved `admin_alert` template:
     ```text
     New Order {{1}} for {{2}}. Customer: {{3}} Phone: {{4}} Address: {{5}} Amount: Rs.{{6}}
     ```
   - Automatically dispatches WhatsApp alerts to Admin (`+91 81244 11259`).
   - Prevents duplicate alerts via `_planetmini_wa_alert_sent` order meta.
3. **WP Admin Dashboard**:
   - Connection status indicator (Connected / Not Connected).
   - Display of saved credentials (WABA ID, Phone ID, Business ID).
   - "Send Test Order Alert" button.
   - "Re-run Embedded Signup" link.
4. **Security**:
   - Never exposes tokens to client-side scripts.
   - Recommended definition in `wp-config.php`: `define('FB_APP_SECRET', '...');`

---

## 🚀 Installation on planetmini.in

### Step 1: Upload Plugin
1. Compress the `planetmini-whatsapp` folder into `planetmini-whatsapp.zip` (already created in project root).
2. Go to **WordPress Admin** > **Plugins** > **Add New** > **Upload Plugin**.
3. Choose `planetmini-whatsapp.zip` and click **Install Now**.
4. Click **Activate Plugin**.

### Step 2: Add App Secret in `wp-config.php`
Open your `wp-config.php` file on your server and add:
```php
define('FB_APP_SECRET', 'f3e55e630a00d533b3f59ceb908fb64c');
```
*(Alternatively, enter it under WP Admin > WhatsApp Alerts > Settings).*

### Step 3: Create Setup Page
1. In WordPress Admin, go to **Pages** > **Add New**.
2. Title: `WhatsApp Setup`
3. Slug / Permalink: `whatsapp-setup` (URL: `https://planetmini.in/whatsapp-setup/`).
4. In page template dropdown on the right sidebar, choose: **WhatsApp Embedded Signup Setup** (or simply paste the shortcode `[planetmini_whatsapp_setup]` in the page content).
5. Publish the page.

### Step 4: Run Embedded Signup
1. Visit `https://planetmini.in/whatsapp-setup/`.
2. Click **Continue with Facebook**.
3. Select your Business Portfolio: **Planetmini - Baby and Toddler wear (526795543261998)**.
4. Select your WhatsApp Account: **2545263782581454**.
5. Select your Phone Number: **1369820972878161** (`+91 81244 11259`).
6. Complete the popup — the plugin will exchange the token and redirect you to WP Admin with a **Connected** badge!

### Step 5: Test Admin Alert
1. In WordPress Admin, go to **WhatsApp Alerts**.
2. Click **Send Test Order Alert**.
3. Check WhatsApp on your phone (`+91 81244 11259`) — the message will arrive immediately!

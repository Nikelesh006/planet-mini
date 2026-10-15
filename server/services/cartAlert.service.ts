import mongoose from 'mongoose';
import CartAlertModel, { type ICartAlert } from '../models/CartAlert.js';
import Profile from '../models/Profile.js';
import { addressStorage } from '../storage.js';
import { sendCartAlertMessage, formatWhatsAppPhone } from './whatsapp.service.js';
import { connectDB } from '../db.js';

// ==========================================
// CONFIGURATION
// ==========================================

// Default delay is 60 minutes (1 hour) as requested.
// Can be overridden in .env (e.g. CART_ALERT_DELAY_MINUTES=1 for testing)
export const getCartAlertDelayMs = (): number => {
  const minutes = Number(process.env.CART_ALERT_DELAY_MINUTES || 60);
  return Math.max(1, minutes) * 60 * 1000;
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Retrieves the user's primary/latest contact address and phone.
 * Checks the 'addresses' collection first, then falls back to Profile.
 */
export async function getUserAddressAndContact(userId: string): Promise<{
  addressFound: boolean;
  phone: string | null;
  customerName: string;
  addressSummary?: string;
}> {
  await connectDB();
  const db = mongoose.connection.db;

  let phone: string | null = null;
  let customerName = 'there';
  let addressFound = false;
  let addressSummary: string | undefined;

  try {
    // 1. Check user addresses collection
    const addresses = await addressStorage.getAddresses(userId);
    if (addresses && addresses.length > 0) {
      // Prefer default address, otherwise the most recently added
      const primaryAddress: any =
        addresses.find((a: any) => a.isDefault) || addresses[addresses.length - 1];

      if (primaryAddress) {
        addressFound = true;
        phone = primaryAddress.phone || null;
        customerName =
          primaryAddress.fullName?.trim() ||
          primaryAddress.name?.trim() ||
          'there';

        addressSummary = [
          primaryAddress.street,
          primaryAddress.city,
          primaryAddress.state,
          primaryAddress.pincode
        ]
          .filter(Boolean)
          .join(', ');
      }
    }

    // 2. Fall back to Profile model if phone or address is not found
    if (!addressFound || !phone) {
      const profile = await Profile.findOne({ userId });
      if (profile) {
        if (!phone && profile.phone) {
          phone = profile.phone;
        }

        if (customerName === 'there' && profile.firstName) {
          customerName = `${profile.firstName} ${profile.lastName || ''}`.trim();
        }

        if (!addressFound && profile.address && profile.address.street) {
          addressFound = true;
          addressSummary = [
            profile.address.street,
            profile.address.city,
            profile.address.state,
            profile.address.pincode
          ]
            .filter(Boolean)
            .join(', ');
        }
      }
    }
  } catch (err) {
    console.error(`[CartAlert] Error checking address for user ${userId}:`, err);
  }

  // Format first name nicely for the template: "Hey {{1}}! 💕👶🏻"
  let cleanFirstName = 'there';
  if (customerName && customerName !== 'there') {
    cleanFirstName = customerName.split(' ')[0].trim();
  }

  return {
    addressFound,
    phone: formatWhatsAppPhone(phone),
    customerName: cleanFirstName,
    addressSummary
  };
}

/**
 * Gets the current active items in the user's cart.
 */
export async function getUserCartItems(userId: string): Promise<any[]> {
  await connectDB();
  try {
    const profile = await Profile.findOne({ userId });
    if (profile && Array.isArray(profile.cartItems) && profile.cartItems.length > 0) {
      return profile.cartItems;
    }

    // Fallback: check carts collection if used
    const db = mongoose.connection.db;
    if (db) {
      const cartDoc = await db.collection('carts').findOne({ userId });
      if (cartDoc && Array.isArray(cartDoc.items) && cartDoc.items.length > 0) {
        return cartDoc.items;
      }
    }
  } catch (err) {
    console.error(`[CartAlert] Error fetching cart items for user ${userId}:`, err);
  }
  return [];
}

// ==========================================
// CORE WORKFLOWS
// ==========================================

/**
 * Called whenever a user updates or adds an item to their cart.
 * If user has cart items AND has an address, schedules the 1-hour abandoned cart alert.
 */
export async function recordCartActivity(userId: string): Promise<ICartAlert | null> {
  if (!userId) return null;

  try {
    await connectDB();

    // 1. Fetch current cart items
    const cartItems = await getUserCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      // Cart is empty -> cancel any existing pending alert
      await cancelCartAlertOnCartCleared(userId);
      return null;
    }

    // 2. Check if address is added
    const contactInfo = await getUserAddressAndContact(userId);
    if (!contactInfo.addressFound || !contactInfo.phone) {
      console.log(
        `[CartAlert] ℹ️ User ${userId} has ${cartItems.length} item(s) in cart, but address/phone is not yet added. Waiting for address before scheduling alert.`
      );
      return null;
    }

    // 3. Both conditions met: cart has items AND address is added!
    const delayMs = getCartAlertDelayMs();
    const scheduledFor = new Date(Date.now() + delayMs);
    const cartCount = cartItems.reduce(
      (sum: number, it: any) => sum + Number(it.quantity || 1),
      0
    );
    const cartTotal = cartItems.reduce(
      (sum: number, it: any) =>
        sum + Number(it.sellingPrice || it.price || 0) * Number(it.quantity || 1),
      0
    );

    // 4. Update existing pending alert or create new one
    let alert = await CartAlertModel.findOne({ userId, status: 'pending' });

    if (alert) {
      alert.phone = contactInfo.phone;
      alert.customerName = contactInfo.customerName;
      alert.cartItems = cartItems;
      alert.cartCount = cartCount;
      alert.cartTotal = cartTotal;
      alert.scheduledFor = scheduledFor;
      await alert.save();

      console.log(
        `[CartAlert] 🔄 Refreshed pending cart alert for user ${userId} (${contactInfo.phone}), scheduled for ${scheduledFor.toISOString()} (in ${Math.round(
          delayMs / 60000
        )} mins)`
      );
    } else {
      alert = await CartAlertModel.create({
        userId,
        phone: contactInfo.phone,
        customerName: contactInfo.customerName,
        cartItems,
        cartCount,
        cartTotal,
        scheduledFor,
        status: 'pending'
      });

      console.log(
        `[CartAlert] ⏱️ Scheduled NEW cart alert for user ${userId} (${contactInfo.phone}), scheduled for ${scheduledFor.toISOString()} (in ${Math.round(
          delayMs / 60000
        )} mins)`
      );
    }

    return alert;
  } catch (err: any) {
    console.error(`[CartAlert] ❌ Failed to record cart activity for user ${userId}:`, err);
    return null;
  }
}

/**
 * Called whenever a user adds or updates an address.
 * If user already has items in their cart, triggers alert scheduling.
 */
export async function recordAddressAdded(userId: string): Promise<ICartAlert | null> {
  if (!userId) return null;
  console.log(`[CartAlert] Address added/updated for user ${userId}. Checking if cart has items...`);
  return await recordCartActivity(userId);
}

/**
 * Called when an order is successfully created or paid.
 * Immediately cancels any pending cart alert for this user.
 */
export async function cancelCartAlertOnOrder(
  userId: string,
  orderId?: string
): Promise<number> {
  if (!userId) return 0;

  try {
    await connectDB();
    const result = await CartAlertModel.updateMany(
      { userId, status: 'pending' },
      {
        $set: {
          status: 'cancelled_order_placed',
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[CartAlert] ✅ Cancelled ${result.modifiedCount} pending cart alert(s) for user ${userId} (Order placed: ${orderId || 'N/A'})`
      );
    }

    return result.modifiedCount;
  } catch (err: any) {
    console.error(`[CartAlert] Error cancelling alert on order for user ${userId}:`, err);
    return 0;
  }
}

/**
 * Called when a user clears their cart.
 */
export async function cancelCartAlertOnCartCleared(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    await connectDB();
    const result = await CartAlertModel.updateMany(
      { userId, status: 'pending' },
      {
        $set: {
          status: 'cancelled_cart_cleared',
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[CartAlert] ℹ️ Cancelled ${result.modifiedCount} pending cart alert(s) for user ${userId} (Cart was emptied)`
      );
    }

    return result.modifiedCount;
  } catch (err: any) {
    console.error(`[CartAlert] Error cancelling alert on cart cleared for user ${userId}:`, err);
    return 0;
  }
}

// ==========================================
// DISPATCHER & BACKGROUND WORKER
// ==========================================

/**
 * Checks for all pending cart alerts whose scheduled time has arrived,
 * re-verifies that no order was placed and cart is not empty,
 * and dispatches the WhatsApp template message.
 */
export async function checkAndSendPendingCartAlerts(): Promise<{
  checked: number;
  sent: number;
  cancelled: number;
  failed: number;
}> {
  const summary = { checked: 0, sent: 0, cancelled: 0, failed: 0 };

  try {
    await connectDB();
    const now = new Date();

    // Query pending alerts where scheduledFor <= now
    const dueAlerts = await CartAlertModel.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    }).limit(50);

    summary.checked = dueAlerts.length;
    if (dueAlerts.length === 0) {
      return summary;
    }

    console.log(`[CartAlert] Found ${dueAlerts.length} due cart alert(s) to process...`);

    const db = mongoose.connection.db;

    for (const alert of dueAlerts) {
      // 1. Atomically claim this alert to prevent race conditions across server instances
      const claimed = await CartAlertModel.findOneAndUpdate(
        { _id: alert._id, status: 'pending' },
        { $set: { status: 'processing', updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (!claimed) {
        continue; // Already picked up by another process
      }

      try {
        // 2. Guard Check A: Has the user placed an order since the alert was created?
        if (db) {
          const recentOrder = await db.collection('orders').findOne({
            userId: claimed.userId,
            createdAt: { $gte: claimed.createdAt }
          });

          if (recentOrder) {
            console.log(
              `[CartAlert] 🛑 User ${claimed.userId} placed order ${recentOrder.orderNumber || recentOrder._id}. Cancelling cart alert.`
            );
            claimed.status = 'cancelled_order_placed';
            await claimed.save();
            summary.cancelled++;
            continue;
          }
        }

        // 3. Guard Check B: Is the cart still non-empty?
        const currentCart = await getUserCartItems(claimed.userId);
        if (!currentCart || currentCart.length === 0) {
          console.log(`[CartAlert] 🛑 User ${claimed.userId}'s cart is now empty. Cancelling cart alert.`);
          claimed.status = 'cancelled_cart_cleared';
          await claimed.save();
          summary.cancelled++;
          continue;
        }

        // 4. Guard Check C: Validate recipient phone number
        const formattedPhone = formatWhatsAppPhone(claimed.phone);
        if (!formattedPhone) {
          console.warn(`[CartAlert] ⚠️ Invalid phone number '${claimed.phone}' for alert ${claimed._id}`);
          claimed.status = 'failed';
          claimed.whatsappError = `Invalid phone format: '${claimed.phone}'`;
          await claimed.save();
          summary.failed++;
          continue;
        }

        // 5. Send WhatsApp Template Message: cart_alert
        console.log(
          `[CartAlert] 📲 Dispatching WhatsApp 'cart_alert' to ${formattedPhone} (${claimed.customerName})...`
        );

        const sendResult = await sendCartAlertMessage(
          formattedPhone,
          claimed.customerName
        );

        if (sendResult.success) {
          claimed.status = 'sent';
          claimed.sentAt = new Date();
          claimed.whatsappMessageId = sendResult.messageId;
          claimed.whatsappError = undefined;
          await claimed.save();
          summary.sent++;
          console.log(
            `[CartAlert] ✅ Cart alert sent successfully to ${formattedPhone} (Message ID: ${sendResult.messageId || 'N/A'})`
          );
        } else {
          claimed.status = 'failed';
          claimed.whatsappError = sendResult.error || 'WhatsApp delivery failed';
          await claimed.save();
          summary.failed++;
          console.error(
            `[CartAlert] ❌ Failed to send cart alert to ${formattedPhone}: ${sendResult.error}`
          );
        }
      } catch (alertProcessErr: any) {
        console.error(`[CartAlert] Error processing alert ${claimed._id}:`, alertProcessErr);
        claimed.status = 'failed';
        claimed.whatsappError = alertProcessErr?.message || 'Processing error';
        await claimed.save().catch(() => {});
        summary.failed++;
      }
    }
  } catch (err: any) {
    console.error('[CartAlert] Error checking pending cart alerts:', err);
  }

  return summary;
}

// ==========================================
// BACKGROUND SCHEDULER
// ==========================================

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Starts the background polling timer for cart alerts (checks every 60 seconds).
 */
export function startCartAlertScheduler(intervalMs: number = 60 * 1000): void {
  if (schedulerTimer) {
    console.log('[CartAlert] Background scheduler already running.');
    return;
  }

  console.log(`[CartAlert] 🚀 Starting abandoned cart alert background worker (check interval: ${intervalMs / 1000}s)`);

  // Run initial check on startup
  checkAndSendPendingCartAlerts().catch((err) => {
    console.error('[CartAlert] Error in startup check:', err);
  });

  schedulerTimer = setInterval(() => {
    checkAndSendPendingCartAlerts().catch((err) => {
      console.error('[CartAlert] Error in scheduler cycle:', err);
    });
  }, intervalMs);

  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }
}

/**
 * Stops the background scheduler (used for clean shutdowns or testing).
 */
export function stopCartAlertScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[CartAlert] Stopped background scheduler.');
  }
}

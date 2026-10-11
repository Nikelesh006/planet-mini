<?php
if (!defined('ABSPATH')) {
    exit;
}

class Planetmini_WhatsApp_WooCommerce {

    public static function init() {
        // Trigger on order placement / status transitions
        add_action('woocommerce_new_order', [__CLASS__, 'on_new_order'], 20, 2);
        add_action('woocommerce_thankyou', [__CLASS__, 'on_thankyou_page'], 20, 1);
        add_action('woocommerce_order_status_processing', [__CLASS__, 'on_order_status_processing'], 20, 1);
    }

    public static function on_new_order($order_id, $order = null) {
        if (!$order && function_exists('wc_get_order')) {
            $order = wc_get_order($order_id);
        }
        if ($order) {
            self::send_order_alert($order);
        }
    }

    public static function on_thankyou_page($order_id) {
        if (!$order_id || !function_exists('wc_get_order')) {
            return;
        }
        $order = wc_get_order($order_id);
        if ($order) {
            self::send_order_alert($order);
        }
    }

    public static function on_order_status_processing($order_id) {
        if (!$order_id || !function_exists('wc_get_order')) {
            return;
        }
        $order = wc_get_order($order_id);
        if ($order) {
            self::send_order_alert($order);
        }
    }

    /**
     * Prepare order details and dispatch WhatsApp alert
     */
    public static function send_order_alert($order) {
        if (!$order instanceof WC_Order) {
            return;
        }

        // Prevent duplicate alerts for the same order
        $already_sent = $order->get_meta('_planetmini_wa_alert_sent', true);
        if ($already_sent) {
            return;
        }

        // Build item summary
        $items = [];
        foreach ($order->get_items() as $item) {
            $items[] = $item->get_name() . ' (x' . $item->get_quantity() . ')';
        }
        $item_summary = !empty($items) ? implode(', ', $items) : 'Products';

        // Extract customer details
        $customer_name = trim($order->get_formatted_billing_full_name());
        if (empty($customer_name)) {
            $customer_name = trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name());
        }
        if (empty($customer_name)) {
            $customer_name = 'Customer';
        }

        $customer_phone = $order->get_billing_phone();
        $city = $order->get_billing_city();
        $state = $order->get_billing_state();
        $address = trim(($city ? $city : '') . ($state ? ', ' . $state : ''));
        if (empty($address)) {
            $address = $order->get_billing_country() ?: 'Online Store';
        }

        $total_formatted = wp_strip_all_tags(html_entity_decode($order->get_formatted_order_total(), ENT_QUOTES, 'UTF-8'));
        // Clean symbols like ₹ for ASCII template variables
        $clean_total = preg_replace('/[^\d\.,]/', '', $total_formatted);
        if (empty($clean_total)) {
            $clean_total = (string)$order->get_total();
        }

        $order_data = [
            'order_id'       => '#' . $order->get_order_number(),
            'item_summary'   => $item_summary,
            'customer_name'  => $customer_name,
            'customer_phone' => $customer_phone ?: 'N/A',
            'address'        => $address,
            'total'          => $clean_total,
        ];

        $success = Planetmini_WhatsApp_API::send_admin_alert($order_data);

        if ($success) {
            $order->update_meta_data('_planetmini_wa_alert_sent', current_time('mysql'));
            $order->save();
        }
    }
}

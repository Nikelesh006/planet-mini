<?php
if (!defined('ABSPATH')) {
    exit;
}

class Planetmini_WhatsApp_Admin {

    public static function init() {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
        add_action('admin_init', [__CLASS__, 'handle_admin_actions']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_styles']);
    }

    public static function add_admin_menu() {
        add_menu_page(
            'Planetmini WhatsApp',
            'WhatsApp Alerts',
            'manage_options',
            'planetmini-whatsapp',
            [__CLASS__, 'render_settings_page'],
            'dashicons-whatsapp',
            56
        );
    }

    public static function enqueue_styles($hook) {
        if ($hook === 'toplevel_page_planetmini-whatsapp') {
            wp_enqueue_style(
                'planetmini-wa-admin',
                PLANETMINI_WA_URL . 'assets/css/admin.css',
                [],
                PLANETMINI_WA_VERSION
            );
        }
    }

    public static function handle_admin_actions() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Test alert action
        if (isset($_POST['planetmini_send_test_alert']) && check_admin_referer('planetmini_wa_test_nonce')) {
            $test_data = [
                'order_id'       => '#TEST-999',
                'item_summary'   => 'Sample Romper (x1)',
                'customer_name'  => 'Test Customer',
                'customer_phone' => '+91 99999 99999',
                'address'        => 'Chennai, TN',
                'total'          => '999',
            ];

            $result = Planetmini_WhatsApp_API::send_admin_alert($test_data);
            if ($result) {
                add_settings_error('planetmini_wa_messages', 'test_success', 'Test alert sent successfully to admin WhatsApp!', 'updated');
            } else {
                add_settings_error('planetmini_wa_messages', 'test_error', 'Failed to send test alert. Check debug.log for Meta API details.', 'error');
            }
        }

        // Save admin phone setting
        if (isset($_POST['planetmini_save_settings']) && check_admin_referer('planetmini_wa_save_nonce')) {
            $admin_number = sanitize_text_field($_POST['admin_number'] ?? '');
            $app_secret   = sanitize_text_field($_POST['app_secret'] ?? '');

            if (!empty($admin_number)) {
                update_option('planetmini_whatsapp_admin_number', preg_replace('/[^\d]/', '', $admin_number));
            }
            if (!empty($app_secret)) {
                update_option('planetmini_whatsapp_app_secret', $app_secret);
            }
            add_settings_error('planetmini_wa_messages', 'save_success', 'Settings saved successfully!', 'updated');
        }
    }

    public static function render_settings_page() {
        $creds = Planetmini_WhatsApp_API::get_credentials();
        $is_connected = !empty($creds['business_token']);
        $admin_phone = get_option('planetmini_whatsapp_admin_number', PLANETMINI_WA_ADMIN_PHONE);
        $app_secret = Planetmini_WhatsApp_API::get_app_secret();
        $is_secret_constant = defined('FB_APP_SECRET');

        settings_errors('planetmini_wa_messages');
        ?>
        <div class="wrap planetmini-wa-wrap">
            <h1 class="wp-heading-inline">Planetmini WhatsApp Cloud API & WooCommerce Alerts</h1>
            <p class="description">Manage your Meta WhatsApp Embedded Signup credentials and automated admin alerts.</p>

            <div class="planetmini-wa-card">
                <h2>Connection Status</h2>
                <div class="planetmini-status-badge <?php echo $is_connected ? 'status-connected' : 'status-disconnected'; ?>">
                    <span class="dashicons <?php echo $is_connected ? 'dashicons-yes-alt' : 'dashicons-warning'; ?>"></span>
                    <?php echo $is_connected ? 'Connected to Meta WhatsApp Cloud API' : 'Not Connected'; ?>
                </div>

                <table class="widefat striped" style="margin-top: 15px;">
                    <tbody>
                        <tr>
                            <th style="width: 220px;">Meta App ID</th>
                            <td><code><?php echo esc_html(PLANETMINI_WA_APP_ID); ?></code></td>
                        </tr>
                        <tr>
                            <th>Meta Config ID</th>
                            <td><code><?php echo esc_html(PLANETMINI_WA_CONFIG_ID); ?></code></td>
                        </tr>
                        <tr>
                            <th>Graph API Version</th>
                            <td><code><?php echo esc_html(PLANETMINI_WA_GRAPH_VERSION); ?></code></td>
                        </tr>
                        <tr>
                            <th>WABA ID</th>
                            <td><code><?php echo esc_html($creds['waba_id'] ?? 'Not set'); ?></code></td>
                        </tr>
                        <tr>
                            <th>Phone Number ID</th>
                            <td><code><?php echo esc_html($creds['phone_number_id'] ?? 'Not set'); ?></code></td>
                        </tr>
                        <tr>
                            <th>Business ID</th>
                            <td><code><?php echo esc_html($creds['business_id'] ?? 'Not set'); ?></code></td>
                        </tr>
                        <tr>
                            <th>Connected At</th>
                            <td><?php echo esc_html($creds['created_at'] ?? 'Never'); ?></td>
                        </tr>
                    </tbody>
                </table>

                <div class="planetmini-actions" style="margin-top: 20px;">
                    <a href="<?php echo esc_url(home_url('/whatsapp-setup/')); ?>" class="button button-primary button-large" target="_blank">
                        <span class="dashicons dashicons-external" style="vertical-align: middle;"></span>
                        <?php echo $is_connected ? 'Re-run Embedded Signup' : 'Launch Embedded Signup'; ?>
                    </a>
                </div>
            </div>

            <?php if ($is_connected): ?>
            <div class="planetmini-wa-card" style="margin-top: 20px;">
                <h2>Test Admin Alert</h2>
                <p>Send a sample WhatsApp template order alert to <strong>+<?php echo esc_html($admin_phone); ?></strong> to verify delivery.</p>
                <form method="post">
                    <?php wp_nonce_field('planetmini_wa_test_nonce'); ?>
                    <button type="submit" name="planetmini_send_test_alert" class="button button-secondary button-large">
                        <span class="dashicons dashicons-testimonial" style="vertical-align: middle;"></span>
                        Send Test Order Alert
                    </button>
                </form>
            </div>
            <?php endif; ?>

            <div class="planetmini-wa-card" style="margin-top: 20px;">
                <h2>Settings</h2>
                <form method="post">
                    <?php wp_nonce_field('planetmini_wa_save_nonce'); ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="admin_number">Admin WhatsApp Number</label></th>
                            <td>
                                <input name="admin_number" type="text" id="admin_number" value="<?php echo esc_attr($admin_phone); ?>" class="regular-text" />
                                <p class="description">Country code without plus sign (e.g., <code>918124411259</code>).</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="app_secret">Meta App Secret</label></th>
                            <td>
                                <?php if ($is_secret_constant): ?>
                                    <input type="text" value="Defined in wp-config.php (FB_APP_SECRET)" class="regular-text" disabled />
                                <?php else: ?>
                                    <input name="app_secret" type="password" id="app_secret" value="<?php echo esc_attr($app_secret); ?>" class="regular-text" />
                                    <p class="description">Recommended: Define <code>define('FB_APP_SECRET', 'your_secret');</code> in <code>wp-config.php</code>.</p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" name="planetmini_save_settings" class="button button-primary">Save Settings</button>
                    </p>
                </form>
            </div>
        </div>
        <?php
    }
}

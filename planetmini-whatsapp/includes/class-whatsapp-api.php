<?php
if (!defined('ABSPATH')) {
    exit;
}

class Planetmini_WhatsApp_API {

    const OPTION_KEY = 'planetmini_whatsapp_credentials';

    /**
     * Get App Secret from wp-config.php constant FB_APP_SECRET or option
     */
    public static function get_app_secret() {
        if (defined('FB_APP_SECRET') && !empty(FB_APP_SECRET)) {
            return FB_APP_SECRET;
        }
        return get_option('planetmini_whatsapp_app_secret', 'f3e55e630a00d533b3f59ceb908fb64c');
    }

    /**
     * Get saved credentials
     */
    public static function get_credentials() {
        return get_option(self::OPTION_KEY, []);
    }

    /**
     * Save credentials in wp_options
     */
    public static function save_credentials($data) {
        return update_option(self::OPTION_KEY, $data);
    }

    /**
     * Exchange temporary auth code for permanent business access token
     */
    public static function exchange_code_for_token($code) {
        $app_id = PLANETMINI_WA_APP_ID;
        $app_secret = self::get_app_secret();
        $version = PLANETMINI_WA_GRAPH_VERSION;

        if (empty($app_secret)) {
            return new WP_Error('missing_secret', 'FB_APP_SECRET is not defined in wp-config.php.');
        }

        $url = "https://graph.facebook.com/{$version}/oauth/access_token";
        $response = wp_remote_get(add_query_arg([
            'client_id'     => $app_id,
            'client_secret' => $app_secret,
            'code'          => $code,
        ], $url), [
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!empty($data['error'])) {
            return new WP_Error('oauth_error', $data['error']['message'] ?? 'Failed to exchange token', $data['error']);
        }

        if (empty($data['access_token'])) {
            return new WP_Error('invalid_response', 'No access_token returned by Meta.', $data);
        }

        return $data;
    }

    /**
     * Ensure the admin_alert template exists on the WABA; if not, create it
     */
    public static function ensure_admin_alert_template($waba_id, $token) {
        $version = PLANETMINI_WA_GRAPH_VERSION;
        $url = "https://graph.facebook.com/{$version}/{$waba_id}/message_templates";

        // 1. Check if template exists
        $check_res = wp_remote_get(add_query_arg([
            'name' => 'admin_alert',
        ], $url), [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
            ],
            'timeout' => 20,
        ]);

        if (!is_wp_error($check_res)) {
            $body = json_decode(wp_remote_retrieve_body($check_res), true);
            $templates = $body['data'] ?? [];
            foreach ($templates as $tmpl) {
                if ($tmpl['name'] === 'admin_alert' && in_array($tmpl['status'], ['APPROVED', 'PENDING'])) {
                    return true;
                }
            }
        }

        // 2. Create admin_alert template if not found
        $body_payload = [
            'name'     => 'admin_alert',
            'category' => 'UTILITY',
            'language' => 'en_US',
            'components' => [
                [
                    'type' => 'BODY',
                    'text' => 'New Order {{1}} for {{2}}. Customer: {{3}} Phone: {{4}} Address: {{5}} Amount: Rs.{{6}}',
                    'example' => [
                        'body_text' => [
                            ['ORD101', 'Baby Romper', 'Priya Sharma', '+919876543210', 'Chennai, TN', '899']
                        ]
                    ]
                ]
            ]
        ];

        $create_res = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode($body_payload),
            'timeout' => 30,
        ]);

        if (is_wp_error($create_res)) {
            error_log('[Planetmini WhatsApp] Failed to create template: ' . $create_res->get_error_message());
            return false;
        }

        $create_body = json_decode(wp_remote_retrieve_body($create_res), true);
        if (!empty($create_body['id'])) {
            error_log('[Planetmini WhatsApp] admin_alert template created successfully with ID: ' . $create_body['id']);
            return true;
        } else {
            error_log('[Planetmini WhatsApp] Template creation response: ' . wp_remote_retrieve_body($create_res));
            return false;
        }
    }

    /**
     * Send admin WhatsApp alert using the template
     */
    public static function send_admin_alert($order_data) {
        $creds = self::get_credentials();
        $token = $creds['business_token'] ?? '';
        $phone_number_id = $creds['phone_number_id'] ?? '1369820972878161';
        $waba_id = $creds['waba_id'] ?? '2545263782581454';
        $admin_phone = get_option('planetmini_whatsapp_admin_number', PLANETMINI_WA_ADMIN_PHONE);

        if (empty($token) || empty($phone_number_id)) {
            error_log('[Planetmini WhatsApp] Cannot send alert: Missing token or phone_number_id.');
            return false;
        }

        // Ensure template exists
        self::ensure_admin_alert_template($waba_id, $token);

        $version = PLANETMINI_WA_GRAPH_VERSION;
        $url = "https://graph.facebook.com/{$version}/{$phone_number_id}/messages";

        $order_id       = (string)($order_data['order_id'] ?? 'N/A');
        $item_summary   = (string)($order_data['item_summary'] ?? 'Items');
        $customer_name  = (string)($order_data['customer_name'] ?? 'Guest');
        $customer_phone = (string)($order_data['customer_phone'] ?? 'N/A');
        $address        = (string)($order_data['address'] ?? 'Online');
        $total          = (string)($order_data['total'] ?? '0');

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type'    => 'individual',
            'to'                => $admin_phone,
            'type'              => 'template',
            'template'          => [
                'name'     => 'admin_alert',
                'language' => [
                    'code' => 'en_US',
                ],
                'components' => [
                    [
                        'type'       => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => substr($order_id, 0, 60)],
                            ['type' => 'text', 'text' => substr($item_summary, 0, 60)],
                            ['type' => 'text', 'text' => substr($customer_name, 0, 60)],
                            ['type' => 'text', 'text' => substr($customer_phone, 0, 30)],
                            ['type' => 'text', 'text' => substr($address, 0, 100)],
                            ['type' => 'text', 'text' => substr($total, 0, 30)],
                        ],
                    ],
                ],
            ],
        ];

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode($payload),
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            error_log('[Planetmini WhatsApp] ❌ HTTP Error sending admin alert: ' . $response->get_error_message());
            return false;
        }

        $resp_body = wp_remote_retrieve_body($response);
        $code = wp_remote_retrieve_response_code($response);

        if ($code >= 200 && $code < 300) {
            error_log('[Planetmini WhatsApp] ✅ Admin alert sent successfully to ' . $admin_phone . ': ' . $resp_body);
            return true;
        } else {
            error_log('[Planetmini WhatsApp] ❌ Meta API error sending alert (Code ' . $code . '): ' . $resp_body);
            return false;
        }
    }
}

<?php
if (!defined('ABSPATH')) {
    exit;
}

class Planetmini_WhatsApp_REST {

    public static function register_routes() {
        register_rest_route('planetmini/v1', '/whatsapp/exchange', [
            'methods'             => 'POST',
            'callback'            => [__CLASS__, 'handle_token_exchange'],
            'permission_callback' => '__return_true', // Open for embedded signup callback, secured by OAuth code verification
        ]);
    }

    public static function handle_token_exchange(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_params();
        }

        $code = sanitize_text_field($params['code'] ?? '');
        $session_info = $params['sessionInfo'] ?? [];

        if (empty($code)) {
            return new WP_REST_Response([
                'success' => false,
                'error'   => 'Missing authorization code from Facebook popup.',
            ], 400);
        }

        // Exchange code with Meta Graph API
        $token_result = Planetmini_WhatsApp_API::exchange_code_for_token($code);

        if (is_wp_error($token_result)) {
            return new WP_REST_Response([
                'success' => false,
                'error'   => $token_result->get_error_message(),
                'details' => $token_result->get_error_data(),
            ], 400);
        }

        $business_token = $token_result['access_token'] ?? '';
        $expires_in     = $token_result['expires_in'] ?? 0;

        // Extract session IDs or fallback to known IDs
        $waba_id         = sanitize_text_field($session_info['waba_id'] ?? $session_info['wabaId'] ?? '2545263782581454');
        $phone_number_id = sanitize_text_field($session_info['phone_number_id'] ?? $session_info['phoneNumberId'] ?? '1369820972878161');
        $business_id     = sanitize_text_field($session_info['business_id'] ?? $session_info['businessId'] ?? '526795543261998');

        $credentials = [
            'business_token'  => $business_token,
            'waba_id'         => $waba_id,
            'phone_number_id' => $phone_number_id,
            'business_id'     => $business_id,
            'expires'         => $expires_in > 0 ? (time() + $expires_in) : 0,
            'created_at'      => current_time('mysql'),
            'status'          => 'connected',
        ];

        Planetmini_WhatsApp_API::save_credentials($credentials);

        // Pre-create/verify template
        Planetmini_WhatsApp_API::ensure_admin_alert_template($waba_id, $business_token);

        error_log('[Planetmini WhatsApp] Credentials saved successfully for WABA: ' . $waba_id);

        return new WP_REST_Response([
            'success'         => true,
            'message'         => 'WhatsApp Embedded Signup completed successfully!',
            'waba_id'         => $waba_id,
            'phone_number_id' => $phone_number_id,
        ], 200);
    }
}

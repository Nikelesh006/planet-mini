<?php
/**
 * Plugin Name: Planetmini WhatsApp Cloud API & Admin Alerts
 * Plugin URI: https://planetmini.in
 * Description: WhatsApp Embedded Signup v4 (Graph API v26.0) and automated WooCommerce admin order alerts for planetmini.in.
 * Version: 1.0.0
 * Author: Planetmini Dev Team
 * Author URI: https://planetmini.in
 * License: GPL-2.0+
 * Text Domain: planetmini-whatsapp
 * Requires at least: 6.0
 * Requires PHP: 8.1
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PLANETMINI_WA_VERSION', '1.0.0');
define('PLANETMINI_WA_PATH', plugin_dir_path(__FILE__));
define('PLANETMINI_WA_URL', plugin_dir_url(__FILE__));

// Meta App & Business Constants
define('PLANETMINI_WA_APP_ID', '1640886047680153');
define('PLANETMINI_WA_CONFIG_ID', '1131025299377723');
define('PLANETMINI_WA_GRAPH_VERSION', 'v26.0');
define('PLANETMINI_WA_ADMIN_PHONE', '918124411259');

// Autoload Classes
require_once PLANETMINI_WA_PATH . 'includes/class-whatsapp-api.php';
require_once PLANETMINI_WA_PATH . 'includes/class-whatsapp-rest.php';
require_once PLANETMINI_WA_PATH . 'includes/class-whatsapp-woocommerce.php';
require_once PLANETMINI_WA_PATH . 'includes/class-whatsapp-admin.php';

class Planetmini_WhatsApp_Plugin {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Initialize REST API
        add_action('rest_api_init', ['Planetmini_WhatsApp_REST', 'register_routes']);

        // Initialize WooCommerce Hooks
        Planetmini_WhatsApp_WooCommerce::init();

        // Initialize Admin Dashboard Settings
        if (is_admin()) {
            Planetmini_WhatsApp_Admin::init();
        }

        // Register Setup Shortcode
        add_shortcode('planetmini_whatsapp_setup', [$this, 'render_setup_shortcode']);

        // Register Page Template filter
        add_filter('page_template', [$this, 'load_whatsapp_setup_template']);
    }

    public function render_setup_shortcode() {
        ob_start();
        include PLANETMINI_WA_PATH . 'templates/page-whatsapp-setup.php';
        return ob_get_clean();
    }

    public function load_whatsapp_setup_template($page_template) {
        if (is_page('whatsapp-setup')) {
            $template_file = PLANETMINI_WA_PATH . 'templates/page-whatsapp-setup.php';
            if (file_exists($template_file)) {
                return $template_file;
            }
        }
        return $page_template;
    }
}

// Bootstrap Plugin
add_action('plugins_loaded', ['Planetmini_WhatsApp_Plugin', 'get_instance']);

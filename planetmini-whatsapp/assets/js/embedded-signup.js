(function () {
    let sessionInfo = {};
    const config = window.PLANETMINI_WA_CONFIG || {};

    // 1. Initialize Facebook JS SDK v26.0
    window.fbAsyncInit = function () {
        FB.init({
            appId            : config.appId || '1640886047680153',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : config.graphVersion || 'v26.0'
        });
    };

    // 2. Message Listener for Embedded Signup events
    window.addEventListener('message', function (event) {
        if (!event.origin.endsWith('facebook.com')) {
            return;
        }

        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (data && data.type === 'WA_EMBEDDED_SIGNUP') {
                if ((data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') && data.data) {
                    sessionInfo = data.data;
                    updateStatus('Account linked on Facebook! Exchanging credentials with your store...', 'loading');
                } else if (data.event === 'CANCEL') {
                    updateStatus('Signup process was cancelled.', 'error');
                }
            }
        } catch (e) {
            // Ignore non-JSON postMessages
        }
    });

    // 3. Callback from FB.login
    window.fbLoginCallback = function (response) {
        if (response.authResponse && response.authResponse.code) {
            const authCode = response.authResponse.code;
            updateStatus('Exchanging authorization code with backend...', 'loading');

            fetch(config.restUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: authCode,
                    sessionInfo: sessionInfo
                })
            })
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                if (data.success) {
                    updateStatus('✅ WhatsApp Onboarding Completed! Redirecting to WP Admin...', 'success');
                    setTimeout(function () {
                        window.location.href = config.adminUrl;
                    }, 2500);
                } else {
                    updateStatus('❌ Error: ' + (data.error || 'Failed to exchange credentials.'), 'error');
                }
            })
            .catch(function (err) {
                updateStatus('❌ Network error communicating with WordPress REST API.', 'error');
            });

        } else {
            updateStatus('Facebook login was not authorized or cancelled.', 'error');
        }
    };

    // 4. Launch Embedded Signup
    window.launchWhatsAppSignup = function () {
        updateStatus('Opening WhatsApp Embedded Signup popup...', 'loading');

        if (typeof FB === 'undefined') {
            updateStatus('Facebook SDK is still loading. Please try again in a moment.', 'error');
            return;
        }

        FB.login(window.fbLoginCallback, {
            config_id: config.configId || '1121546823949510',
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                featureType: 'whatsapp_business_app_onboarding',
                setup: {}
            }
        });
    };

    function updateStatus(message, type) {
        const container = document.getElementById('status-container');
        const msgEl = document.getElementById('status-message');
        const spinner = document.getElementById('status-spinner');
        const btn = document.getElementById('btn-whatsapp-signup');

        if (!container || !msgEl) return;

        container.style.display = 'block';
        msgEl.innerText = message;

        if (type === 'loading') {
            spinner.style.display = 'inline-block';
            container.className = 'status-container status-loading';
            if (btn) btn.disabled = true;
        } else if (type === 'success') {
            spinner.style.display = 'none';
            container.className = 'status-container status-success';
            if (btn) btn.style.display = 'none';
        } else if (type === 'error') {
            spinner.style.display = 'none';
            container.className = 'status-container status-error';
            if (btn) btn.disabled = false;
        }
    }
})();

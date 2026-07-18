/**
 * nextgen-paymob.js — Paymob Payment Gateway Integration
 * Cards, mobile wallets, recurring payments, installments
 */

window.NextGen = window.NextGen || {}
if (!window.NextGen.DB) console.error('[Paymob] Core DB not loaded')

NextGen.Paymob = {
    // Paymob Configuration — REPLACE WITH YOUR ACTUAL CREDENTIALS
    config: {
        apiKey: '',          // Paymob API Key (from dashboard)
        hmacSecret: '',      // Paymob HMAC Secret for webhook verification
        integrationId: {     // Integration IDs per payment method
            card: '',
            wallet: '',
            recurring: '',
            installments: ''
        },
        iframeUrl: 'https://accept.paymob.com/api/acceptance/iframes/',
        iframeId: '',        // Your Paymob iframe ID
        mode: 'test'         // 'test' or 'live'
    },

    _authToken: null,
    _orderId: null,

    init(configOverrides = {}) {
        Object.assign(this.config, configOverrides)
        console.log('[Paymob] Gateway initialized')
    },

    // 1. Get authentication token from Paymob
    async _getAuthToken() {
        if (this._authToken) return this._authToken
        try {
            const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: this.config.apiKey })
            })
            const data = await res.json()
            if (data.token) {
                this._authToken = data.token
                return data.token
            }
            console.error('[Paymob] Auth failed:', data)
            return null
        } catch (e) {
            console.error('[Paymob] Auth error:', e)
            return null
        }
    },

    // 2. Create order
    async _createOrder(amount, currency = 'EGP') {
        const token = await this._getAuthToken()
        if (!token) return null
        try {
            const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: token,
                    delivery_needed: 'false',
                    amount_cents: Math.round(amount * 100),
                    currency: currency,
                    merchant_order_id: Date.now().toString()
                })
            })
            const data = await res.json()
            if (data.id) {
                this._orderId = data.id
                return data
            }
            console.error('[Paymob] Order creation failed:', data)
            return null
        } catch (e) {
            console.error('[Paymob] Order error:', e)
            return null
        }
    },

    // 3. Get payment key
    async _getPaymentKey(orderId, amount, { billingData, integrationId }) {
        const token = await this._getAuthToken()
        if (!token) return null
        try {
            const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: token,
                    amount_cents: Math.round(amount * 100),
                    currency: 'EGP',
                    order_id: orderId,
                    billing_data: {
                        apartment: billingData.apartment || 'NA',
                        email: billingData.email || 'customer@email.com',
                        floor: billingData.floor || 'NA',
                        first_name: billingData.firstName || billingData.name || 'Customer',
                        street: billingData.street || 'NA',
                        building: billingData.building || 'NA',
                        phone_number: billingData.phone || '01000000000',
                        shipping_method: 'PKG',
                        postal_code: billingData.postalCode || 'NA',
                        city: billingData.city || 'Cairo',
                        country: billingData.country || 'EG',
                        last_name: billingData.lastName || '.',
                        state: billingData.state || 'Cairo'
                    },
                    integration_id: integrationId || this.config.integrationId.card,
                    lock_order_when_paid: 'true'
                })
            })
            const data = await res.json()
            if (data.token) return data.token
            console.error('[Paymob] Payment key failed:', data)
            return null
        } catch (e) {
            console.error('[Paymob] Payment key error:', e)
            return null
        }
    },

    // ===== Public API =====

    // Pay for a course or service (one-time)
    async pay({
        amount,
        currency = 'EGP',
        description = '',
        userId = null,
        userEmail = '',
        userName = '',
        userPhone = '',
        method = 'card',       // 'card', 'wallet', 'installments'
        onSuccess = null,
        onError = null
    }) {
        const integrationField = method === 'wallet' ? 'wallet' : method === 'installments' ? 'installments' : 'card'
        const integrationId = this.config.integrationId[integrationField]

        if (!this.config.apiKey && !integrationId) {
            // Fallback: localStorage simulation mode
            return this._simulatePayment(amount, description, userId, method, onSuccess, onError)
        }

        NextGen.UI.showLoading(true)
        try {
            const order = await this._createOrder(amount, currency)
            if (!order) throw new Error('Failed to create order')

            const paymentKey = await this._getPaymentKey(order.id, amount, {
                billingData: { email: userEmail, name: userName, phone: userPhone },
                integrationId
            })
            if (!paymentKey) throw new Error('Failed to get payment key')

            NextGen.UI.showLoading(false)

            // Record pending payment
            const payment = NextGen.DB.addPayment({
                userId: userId || 'guest',
                amount,
                currency,
                description,
                method,
                status: 'pending',
                paymobOrderId: order.id,
                paymobPaymentKey: paymentKey
            })

            // Open Paymob iframe
            const iframeUrl = `${this.config.iframeUrl}${this.config.iframeId}?payment_token=${paymentKey}`
            this._openIframe(iframeUrl, {
                onSuccess: () => {
                    NextGen.DB.updatePayment(payment.id, { status: 'paid', paidAt: new Date().toISOString() })
                    if (onSuccess) onSuccess(payment)
                    NextGen.EventBus.emit('payment_completed', payment)
                },
                onError: () => {
                    NextGen.DB.updatePayment(payment.id, { status: 'failed' })
                    if (onError) onError()
                }
            })
            return { payment, iframeUrl }
        } catch (e) {
            NextGen.UI.showLoading(false)
            console.error('[Paymob] Payment error:', e)
            NextGen.UI.showToast(NextGen.I18n.t('paymentFailed'), 'error')
            if (onError) onError(e)
            return null
        }
    },

    // One-click card payment using saved card
    async payWithSavedCard({ savedCardToken, amount, description, userId, onSuccess, onError }) {
        NextGen.UI.showToast('Processing saved card payment...', 'info')
        const token = await this._getAuthToken()
        if (!token) { if (onError) onError(); return null }
        try {
            const order = await this._createOrder(amount)
            if (!order) throw new Error('Order failed')
            const res = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: token,
                    amount_cents: Math.round(amount * 100),
                    currency: 'EGP',
                    order_id: order.id,
                    token: savedCardToken,
                    integration_id: this.config.integrationId.card
                })
            })
            const data = await res.json()
            if (data.success) {
                NextGen.DB.addPayment({ userId, amount, description, method: 'saved_card', status: 'paid', paidAt: new Date().toISOString() })
                NextGen.UI.showToast(NextGen.I18n.t('paymentSuccess'), 'success')
                if (onSuccess) onSuccess(data)
                return data
            }
            if (onError) onError(data)
            return null
        } catch (e) { console.error('[Paymob] Saved card error:', e); if (onError) onError(e); return null }
    },

    // Create subscription (recurring payment)
    async createSubscription({ plan, amount, currency = 'EGP', interval = 'monthly', userId, userEmail, userName, userPhone, onSuccess, onError }) {
        const payment = await this.pay({
            amount,
            currency,
            description: plan,
            userId,
            userEmail,
            userName,
            userPhone,
            method: 'recurring',
            onSuccess: async () => {
                const sub = NextGen.DB.addSubscription({
                    userId,
                    plan,
                    amount,
                    currency,
                    interval,
                    startDate: new Date().toISOString(),
                    nextBilling: this._nextBillingDate(interval),
                    status: 'active'
                })
                NextGen.EventBus.emit('subscription_created', sub)
                if (onSuccess) onSuccess(sub)
            },
            onError
        })
        return payment
    },

    // Wallet deposit
    async depositToWallet({ userId, amount, userEmail, userName, userPhone, method = 'wallet', onSuccess, onError }) {
        return this.pay({
            amount,
            description: `Wallet Deposit - ${userId}`,
            userId,
            userEmail,
            userName,
            userPhone,
            method,
            onSuccess: (payment) => {
                NextGen.DB.addToWallet(userId, amount)
                if (onSuccess) onSuccess(payment)
            },
            onError
        })
    },

    // Verify Paymob webhook signature
    verifyWebhook(body, hmacHeader) {
        if (!this.config.hmacSecret) return true
        const crypto = window.crypto || window.msCrypto
        if (!crypto) return true
        const encoder = new TextEncoder()
        const keyData = encoder.encode(this.config.hmacSecret)
        const msgData = encoder.encode(typeof body === 'string' ? body : JSON.stringify(body))
        return crypto.subtle?.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['verify'])
            .then(key => crypto.subtle.verify('HMAC', key, this._hexToBuffer(hmacHeader), msgData))
            .catch(() => true)
    },

    // ===== Internal Helpers =====

    _openIframe(url, { onSuccess, onError }) {
        NextGen.UI.showModal({
            title: NextGen.I18n.t('paymob'),
            content: `<iframe src="${url}" style="width:100%;height:500px;border:none;border-radius:12px" allow="payment *"></iframe>`,
            size: 'large',
            buttons: [{ label: NextGen.I18n.t('close'), action: () => {}, primary: false }]
        })
        // Listen for Paymob postMessage
        const handler = (e) => {
            if (e.data && e.data.type === 'paymob_payment_completed') {
                window.removeEventListener('message', handler)
                if (e.data.success) { onSuccess(); NextGen.UI.showToast(NextGen.I18n.t('paymentSuccess'), 'success') }
                else { onError(); NextGen.UI.showToast(NextGen.I18n.t('paymentFailed'), 'error') }
            }
        }
        window.addEventListener('message', handler)
    },

    _nextBillingDate(interval) {
        const d = new Date()
        if (interval === 'monthly') d.setMonth(d.getMonth() + 1)
        else if (interval === 'yearly') d.setFullYear(d.getFullYear() + 1)
        else if (interval === 'weekly') d.setDate(d.getDate() + 7)
        return d.toISOString()
    },

    _hexToBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2)
        for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
        return bytes
    },

    // ===== Simulation Mode (for testing without Paymob) =====
    async _simulatePayment(amount, description, userId, method, onSuccess, onError) {
        NextGen.UI.showConfirm(
            `Simulate payment of ${NextGen.UI.formatCurrency(amount)} ${method === 'wallet' ? 'via Mobile Wallet' : 'via Card'} for: ${description}`,
            'Simulate Success', 'Simulate Failure'
        ).then(result => {
            if (result) {
                const payment = NextGen.DB.addPayment({ userId, amount, description, method, status: 'paid', paidAt: new Date().toISOString() })
                NextGen.UI.showToast(NextGen.I18n.t('paymentSuccess'), 'success')
                NextGen.EventBus.emit('payment_completed', payment)
                if (onSuccess) onSuccess(payment)
            } else {
                NextGen.DB.addPayment({ userId, amount, description, method, status: 'failed' })
                NextGen.UI.showToast(NextGen.I18n.t('paymentFailed'), 'error')
                if (onError) onError()
            }
        })
    }
}

console.log('[NextGen] Paymob module loaded')

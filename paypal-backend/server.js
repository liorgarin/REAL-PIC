const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// PayPal credentials from .env
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// These should be the public, externally accessible URLs
// provided by your ngrok tunnels. Make sure your static server
// serving success.html and cancel.html is accessible via ngrok.
const RETURN_URL = 'https://YOUR_NGROK_SUBDOMAIN.ngrok.io/success.html';
const CANCEL_URL = 'https://YOUR_NGROK_SUBDOMAIN.ngrok.io/cancel.html';

async function generateAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  if (!data.access_token) {
    throw new Error('No access token from PayPal');
  }
  return data.access_token;
}

async function createOrder(accessToken, price) {
  const priceStr = String(price);
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: priceStr
        }
      }],
      application_context: {
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL
      }
    })
  });

  const order = await response.json();
  return order;
}

app.post('/create-order', async (req, res) => {
  const { price } = req.body;
  if (!price) {
    return res.status(400).json({ error: 'Price is required' });
  }

  try {
    const accessToken = await generateAccessToken();
    const order = await createOrder(accessToken, price);
    const approveLink = order.links?.find(link => link.rel === 'approve')?.href;
    if (!approveLink) {
      console.error('No approve link found in order response', order);
      return res.status(500).json({ error: 'No approve link found' });
    }

    res.json({ approveLink });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

const PORT = 3002;
app.listen(PORT, () => console.log(`PayPal backend running on port ${PORT}`));
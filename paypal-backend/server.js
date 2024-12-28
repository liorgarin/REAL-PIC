const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error("PayPal credentials missing in .env");
  process.exit(1);
}

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// Replace with your actual ngrok domain
const NGROK_DOMAIN = 'https://15378f3c69be.ngrok.app';
const RETURN_URL = `${NGROK_DOMAIN}/success.html`;
const CANCEL_URL = `${NGROK_DOMAIN}/cancel.html`;

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
    console.error("PayPal access token not received:", data);
    throw new Error('No access token from PayPal');
  }
  return data.access_token;
}

async function createOrder(accessToken, price) {
  const priceStr = String(price);
  const body = {
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
  };

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  const order = await response.json();
  if (response.status !== 201) {
    console.error('Failed to create order with PayPal:', order);
    throw new Error('PayPal order creation failed');
  }

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
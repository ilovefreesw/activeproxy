# activeproxy

A proxy webhook for Facebook Lead Ads that forwards lead notifications to Activepieces. Designed for serverless deployment on Vercel.  
Supports Facebook verification handshake (GET) and forwards incoming lead POSTs.

## Features

- Secure Facebook Verification (`GET /api/webhook`)
- Forwards POST payloads to Activepieces
- Uses environment variables for configuration
- Easily deployable to Vercel

## 1. Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/ilovefreesw/activeproxy.git
   cd activeproxy
   ```

2. **Provide environment variables:**
    - Copy `.env.example` to `.env` or configure them in your Vercel project settings.
    - **Variables:**
      - `FB_VERIFY_TOKEN`: The Facebook webhook verification token you set in your Facebook App.
      - `ACTIVEPIECES_URL`: The Activepieces endpoint (e.g. `https://your-activepieces-server.com/api/v1/app-events/facebook-leads`)

3. **Deploy to Vercel:**
   - Go to the [Vercel dashboard](https://vercel.com/new)
   - Import the repository
   - Link or create a project, set up environment variables, and deploy

4. **Set the Webhook URL in Facebook Developer Settings:**
   ```
   https://<your-vercel-domain>/api/webhook
   ```
   Use your `FB_VERIFY_TOKEN` for verification in your Facebook App.

## 2. Environment Example

```
FB_VERIFY_TOKEN=your-facebook-verify-token
ACTIVEPIECES_URL=https://your-activepieces-server.com/api/v1/app-events/facebook-leads
```

## 3. How it works

- **Verification (GET):**  
  Facebook sends a GET request with `hub.verify_token` and `hub.challenge`. If the token matches, the challenge value is returned.

- **Notification (POST):**  
  Facebook sends POST payloads for new leads. The payload is logged and forwarded to your Activepieces URL. The response from Activepieces is relayed back to Facebook.

## 4. Customizing

- The main serverless function is in [api/webhook.js](api/webhook.js).
- Logging is via `console.log`.
- Add additional logging or error handling as required.

## 5. License

MIT — ilovefreesw

const crypto = require('crypto');

// Configuration from environment variables
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'inklik-integrations-321';
const ACTIVEPIECES_URL = process.env.ACTIVEPIECES_URL;

// Logger function
function logMsg(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${msg}`);
}

// Handle GET (Facebook verification)
async function handleGet(req, res) {
  const { hub_mode: mode, hub_challenge: challenge, hub_verify_token: verifyToken } = req.query;
  
  logMsg(`[GET] mode=${mode}, token=${verifyToken}, challenge=${challenge}`);
  
  if (mode === 'subscribe' && verifyToken === FB_VERIFY_TOKEN) {
    logMsg('[GET] Verification SUCCESS - sending challenge');
    res.status(200).send(challenge);
    return;
  }
  
  logMsg('[GET] Verification FAILED - token mismatch');
  res.status(403).send('Forbidden');
}

// Handle POST (Facebook lead notifications)
async function handlePost(req, res) {
  logMsg('[POST] Received payload, forwarding to Activepieces...');
  
  if (!ACTIVEPIECES_URL) {
    logMsg('[POST] Error: ACTIVEPIECES_URL environment variable not set');
    res.status(500).json({ error: 'ACTIVEPIECES_URL not configured' });
    return;
  }
  
  try {
    const payload = JSON.stringify(req.body);
    
    // Forward to Activepieces
    const forwardRes = await fetch(ACTIVEPIECES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward signature header if present
        ...(req.headers['x-hub-signature-256'] && {
          'X-Hub-Signature-256': req.headers['x-hub-signature-256']
        }),
      },
      body: payload,
    });
    
    const responseData = await forwardRes.text();
    const httpCode = forwardRes.status;
    
    logMsg(`[POST] Activepieces response: ${httpCode}`);
    res.status(httpCode).send(responseData);
  } catch (error) {
    logMsg(`[POST] Error forwarding to Activepieces: ${error.message}`);
    res.status(500).json({ error: 'Failed to forward webhook' });
  }
}

// Main handler
module.exports = async (req, res) => {
  // Set CORS headers (optional, adjust as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    await handleGet(req, res);
    return;
  }
  
  if (req.method === 'POST') {
    await handlePost(req, res);
    return;
  }
  
  res.status(405).send('Method Not Allowed');
};
// /root/deploy-hook/server.js

const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3001;

// Middleware to parse JSON body (required for GitHub payload)
app.use(express.json());

// GitHub Webhook Endpoint
app.post('/payload', (req, res) => {
  console.log('🔔 Webhook received:', req.body);

  // Execute your deploy script
  exec('sh /root/pull.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deploy error:', error);
      return res.status(500).send('Deploy failed.');
    }

    console.log('✅ Deploy output:\n', stdout);
    res.status(200).send('OK');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Deploy hook server running on port ${PORT}`);
});

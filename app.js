const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON (for GitHub Webhooks)
app.use(express.json());

// Serve static files (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve your main HTML (optional if you're using static index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GitHub webhook endpoint
app.post('/webhook', (req, res) => {
  exec('git pull origin main && pm2 restart questionnaire', (err, stdout, stderr) => {
    if (err) {
      console.error(`Webhook Error: ${err}`);
      return res.status(500).send('Webhook error');
    }
    console.log(`Webhook Output:\n${stdout}`);
    res.status(200).send('Deployment successful');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

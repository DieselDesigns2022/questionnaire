const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ GITHUB WEBHOOK AUTO-DEPLOY ROUTE
app.post('/webhook', (req, res) => {
  console.log('🔄 Webhook received. Pulling changes...');
  exec('sh ./pull.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return res.status(500).send('Webhook error');
    }
    if (stderr) {
      console.error(`⚠️ Stderr: ${stderr}`);
    }
    console.log(`✅ Stdout: ${stdout}`);
    res.status(200).send('Webhook received and deployment triggered');
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 App listening at http://localhost:${port}`);
});

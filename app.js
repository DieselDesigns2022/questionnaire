const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Root route
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ GITHUB WEBHOOK ROUTE
app.post('/webhook', (req, res) => {
  console.log('✅ Webhook received. Pulling latest changes...');

  exec('sh ./pull.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Pull failed:', error.message);
      return res.status(500).send('Pull failed');
    }

    if (stderr) {
      console.error('⚠️ stderr:', stderr);
    }

    console.log('✅ Pull output:\n', stdout);
    res.status(200).send('✅ Pull completed successfully.');
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});

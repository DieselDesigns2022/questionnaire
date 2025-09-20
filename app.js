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

// ✅ WEBHOOK ROUTE
app.post('/webhook', (req, res) => {
  console.log('✅ Webhook received. Pulling changes...');
  exec('sh ./pull.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ exec error: ${error}`);
      return res.status(500).send('Webhook error: Pull failed.');
    }
    console.log(`✅ Pull script output:\n${stdout}`);
    res.status(200).send('✅ Pull completed.');
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 App listening at http://localhost:${port}`);
});

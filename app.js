const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Create data folder structure if not exists
const submissionsDir = path.join(__dirname, 'data', 'submissions');
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

// Public form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Get agreement text
app.get('/api/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'agreement.txt');
  if (!fs.existsSync(filePath)) return res.send('');
  const text = fs.readFileSync(filePath, 'utf8');
  res.send(text);
});

// Save form data
app.post('/submit', (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(submissionsDir, `${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
  res.send({ success: true });
});

// Admin authentication (basic)
app.post('/admin/save-agreement', (req, res) => {
  const { password, text } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'agreement.txt'), text);
  res.send({ success: true });
});

// Fetch all submissions (admin only)
app.post('/admin/submissions', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const files = fs.readdirSync(submissionsDir);
  const data = files.map(file => {
    const content = fs.readFileSync(path.join(submissionsDir, file));
    return { file, content: JSON.parse(content) };
  });

  res.send(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

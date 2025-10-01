// === Serve individual submission content ===
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const submissionsDir = path.join(__dirname, 'data/submissions');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve admin panel
app.use(express.static(__dirname));

// API to list all submission files
app.get('/submissions', (req, res) => {
  fs.readdir(submissionsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Could not list submissions.' });
    }
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    res.json(jsonFiles);
  });
});

// 🔧 NEW: API to serve individual submission JSON
app.get('/submissions/:filename', (req, res) => {
  const filePath = path.join(submissionsDir, req.params.filename);
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    try {
      const json = JSON.parse(content);
      res.json(json);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// Form submission POST route
app.post('/submit', (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const fileName = `submission-${timestamp}.json`;
  const filePath = path.join(submissionsDir, fileName);
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), err => {
    if (err) {
      return res.status(500).send('Error saving submission.');
    }
    res.redirect('/thankyou.html');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

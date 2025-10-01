// app.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const submissionsDir = path.join(__dirname, 'data');
if (!fs.existsSync(submissionsDir)) {
  fs.mkdirSync(submissionsDir);
}

// Handle form submissions
app.post('/submit', (req, res) => {
  const data = req.body;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `submission-${timestamp}.json`;

  fs.writeFile(path.join(submissionsDir, filename), JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Failed to save submission:', err);
      return res.status(500).send('Internal Server Error');
    }
    console.log(`✔️ Saved submission: ${filename}`);
    res.send('<h2>Thanks for submitting! ✅</h2><a href="/">Back to home</a>');
  });
});

// Serve list of submissions for admin
app.get('/submissions', (req, res) => {
  fs.readdir(submissionsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read submissions directory' });
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  });
});

// Serve individual JSON file
app.get('/submissions/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(submissionsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`🚀 Questionnaire backend running on http://localhost:${PORT}`);
});

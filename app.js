const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// File upload handling
const upload = multer({ dest: 'uploads/' });

// === ROUTES ===

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve dynamic form page (if applicable)
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'index2.html'));
});

// Handle form submission
app.post('/submit', upload.single('image'), (req, res) => {
  const { name, email } = req.body;
  const image = req.file;

  const submission = {
    name,
    email,
    image: image ? image.filename : null,
    submittedAt: new Date().toISOString()
  };

  const submissionsPath = path.join(__dirname, 'data', 'submissions');
  if (!fs.existsSync(submissionsPath)) fs.mkdirSync(submissionsPath);

  const fileName = `${Date.now()}-${name.replace(/\s+/g, '_')}.json`;
  fs.writeFile(
    path.join(submissionsPath, fileName),
    JSON.stringify(submission, null, 2),
    err => {
      if (err) {
        console.error('Failed to save submission:', err);
        return res.status(500).send('Submission failed');
      }
      res.send('Submission successful!');
    }
  );
});

// === ADMIN ROUTES ===

// Load questions
app.get('/admin/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'questions.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read questions');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Save questions
app.post('/admin/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'questions.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', err => {
    if (err) return res.status(500).send('Failed to save questions');
    res.sendStatus(200);
  });
});

// Load agreement text
app.get('/admin/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'agreement.txt');
  fs.readFile(filePath, 'utf8', (err, text) => {
    if (err) return res.status(500).send('Failed to read agreement');
    res.type('text/plain').send(text);
  });
});

// Save agreement text
app.post('/admin/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'agreement.txt');
  fs.writeFile(filePath, req.body.text, 'utf8', err => {
    if (err) return res.status(500).send('Failed to save agreement');
    res.sendStatus(200);
  });
});

// === START SERVER ===
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Enable JSON body parsing

// File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
app.post('/submit', upload.single('image'), (req, res) => {
  const submission = req.body;
  if (req.file) {
    submission.image = `/uploads/${req.file.filename}`;
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(__dirname, 'data', 'submissions', `submission-${timestamp}.json`);

  fs.writeFile(filePath, JSON.stringify(submission, null, 2), err => {
    if (err) {
      console.error('Failed to save submission:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/thank-you.html');
  });
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// Admin Panel Endpoints
// =======================

const QUESTIONS_PATH = path.join(__dirname, 'data', 'questions.json');
const AGREEMENT_PATH = path.join(__dirname, 'data', 'agreement.txt');

// Get questions JSON
app.get('/admin/questions', (req, res) => {
  fs.readFile(QUESTIONS_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read questions' });
    res.json(JSON.parse(data));
  });
});

// Save questions JSON
app.post('/admin/questions', (req, res) => {
  fs.writeFile(QUESTIONS_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save questions' });
    res.json({ success: true });
  });
});

// Get agreement text
app.get('/admin/agreement', (req, res) => {
  fs.readFile(AGREEMENT_PATH, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read agreement.txt' });
    res.send(data);
  });
});

// Save agreement text
app.post('/admin/agreement', (req, res) => {
  const { text } = req.body;
  fs.writeFile(AGREEMENT_PATH, text, err => {
    if (err) return res.status(500).json({ error: 'Failed to save agreement' });
    res.json({ success: true });
  });
});

// View submissions in Admin Panel
app.get('/admin/submissions', (req, res) => {
  const submissionsDir = path.join(__dirname, 'data', 'submissions');
  fs.readdir(submissionsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read submissions directory' });

    const submissions = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(submissionsDir, file), 'utf-8');
        return JSON.parse(content);
      });

    res.json(submissions);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

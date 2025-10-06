const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve admin.html manually if needed
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// ✅ NEW: GET /admin/questions – used by admin.html
app.get('/admin/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Failed to read questions.json:', err);
      return res.status(500).send('Failed to load questions');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// ✅ NEW: POST /admin/questions – saves updated questions
app.post('/admin/questions', (req, res) => {
  const questions = req.body;
  const filePath = path.join(__dirname, 'data/questions.json');

  fs.writeFile(filePath, JSON.stringify(questions, null, 2), err => {
    if (err) {
      console.error('❌ Failed to save questions:', err);
      return res.status(500).send('Failed to save questions');
    }
    res.sendStatus(200);
  });
});

// ✅ Load agreement.txt
app.get('/admin/agreement', (req, res) => {
  fs.readFile(path.join(__dirname, 'data/agreement.txt'), 'utf8', (err, text) => {
    if (err) {
      console.error('❌ Failed to read agreement.txt:', err);
      return res.status(500).send('Failed to load agreement');
    }
    res.send(text);
  });
});

// ✅ Save agreement.txt
app.post('/admin/agreement', (req, res) => {
  const { text } = req.body;
  fs.writeFile(path.join(__dirname, 'data/agreement.txt'), text, err => {
    if (err) {
      console.error('❌ Failed to save agreement:', err);
      return res.status(500).send('Failed to save agreement');
    }
    res.sendStatus(200);
  });
});

// ✅ Get all submissions
app.get('/admin/submissions', (req, res) => {
  const submissionsDir = path.join(__dirname, 'data/submissions');
  fs.readdir(submissionsDir, (err, files) => {
    if (err) {
      console.error('❌ Failed to read submissions:', err);
      return res.status(500).send('Failed to load submissions');
    }

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const submissions = [];

    let count = jsonFiles.length;
    if (count === 0) return res.json(submissions);

    jsonFiles.forEach(file => {
      fs.readFile(path.join(submissionsDir, file), 'utf8', (err, data) => {
        if (!err) {
          try {
            submissions.push({ file, content: JSON.parse(data) });
          } catch (e) {
            console.warn('⚠️ Invalid JSON in:', file);
          }
        }
        count--;
        if (count === 0) res.json(submissions);
      });
    });
  });
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

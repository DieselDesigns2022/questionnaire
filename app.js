const fs = require('fs');
const path = require('path');

// Load Questions
app.get('/admin/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to load questions');
    res.json(JSON.parse(data));
  });
});

// Save Questions
app.post('/admin/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).send('Failed to save questions');
    res.send('Saved questions');
  });
});

// Load Agreement
app.get('/admin/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data/agreement.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to load agreement');
    res.send(data);
  });
});

// Save Agreement
app.post('/admin/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data/agreement.txt');
  fs.writeFile(filePath, req.body.text || '', (err) => {
    if (err) return res.status(500).send('Failed to save agreement');
    res.send('Saved agreement');
  });
});

// Load Submissions
app.get('/admin/submissions', (req, res) => {
  const dir = path.join(__dirname, 'data/submissions');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).send('Failed to load submissions');
    res.json(files);
  });
});

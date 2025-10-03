const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Load Submissions
app.get('/submissions', (req, res) => {
  const dirPath = path.join(__dirname, 'data/submissions');
  fs.readdir(dirPath, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read submissions' });
    const submissions = [];
    files.forEach(file => {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      try {
        submissions.push(JSON.parse(content));
      } catch (e) {
        console.error(`Failed to parse: ${file}`);
      }
    });
    res.json(submissions);
  });
});

// Save new submission
app.post('/submit', upload.single('image'), (req, res) => {
  const submission = req.body;
  if (req.file) {
    submission.image = `/uploads/${req.file.filename}`;
  }

  const filePath = path.join(__dirname, 'data/submissions', `${Date.now()}.json`);
  fs.writeFile(filePath, JSON.stringify(submission, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save submission' });
    res.json({ success: true });
  });
});

// Get & Save questions
app.get('/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read questions' });
    res.json(JSON.parse(data));
  });
});

app.post('/questions', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save questions' });
    res.json({ success: true });
  });
});

// Agreement routes
app.get('/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data/agreement.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read agreement' });
    res.send(data);
  });
});

app.post('/agreement', (req, res) => {
  const filePath = path.join(__dirname, 'data/agreement.txt');
  fs.writeFile(filePath, req.body.text, err => {
    if (err) return res.status(500).json({ error: 'Failed to save agreement' });
    res.json({ success: true });
  });
});


// ✅ ✅ ✅ WEBHOOK ROUTE (auto-pull from GitHub)
app.post('/webhook', (req, res) => {
  exec('git pull origin main', { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) {
      console.error('Webhook git pull failed:', stderr);
      return res.status(500).send('Git pull failed');
    }
    console.log('Webhook git pull success:', stdout);
    res.status(200).send('Git pulled successfully');
  });
});

app.listen(port, () => {
  console.log(`Diesel Designs Questionnaire running on port ${port}`);
});

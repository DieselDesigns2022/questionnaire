const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(dataDir, 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Form submission handler
app.post('/submit', upload.any(), (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const savePath = path.join(dataDir, `submission-${timestamp}.json`);
  const data = {
    submittedAt: timestamp,
    fields: req.body,
    files: req.files?.map(file => ({
      originalName: file.originalname,
      storedAs: file.filename,
      path: file.path
    }))
  };

  fs.writeFile(savePath, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('Error saving submission:', err);
      return res.status(500).send('Submission failed.');
    }
    res.send('<h2>✅ Thank you! Your response has been saved.</h2><p><a href="/index2.html">Back to form</a></p>');
  });
});

// Admin route to list all submission JSON files
app.get('/submissions', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading submissions:', err);
      return res.status(500).json({ error: 'Could not read submissions.' });
    }

    const submissions = files.filter(file =>
      file.startsWith('submission-') && file.endsWith('.json')
    );
    res.json(submissions);
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('✅ Questionnaire backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

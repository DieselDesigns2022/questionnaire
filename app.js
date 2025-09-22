const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Create data folder if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'data', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve HTML/CSS/JS

// Form submission handler
app.post('/submit', upload.any(), (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const data = {
    submittedAt: timestamp,
    fields: req.body,
    files: req.files?.map(file => ({
      originalName: file.originalname,
      storedAs: file.filename,
      path: file.path
    }))
  };

  const savePath = path.join(__dirname, 'data', `submission-${timestamp}.json`);
  fs.writeFile(savePath, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('Failed to save submission:', err);
      return res.status(500).send('Something went wrong.');
    }
    res.send('<h2>Thank you! Your response has been submitted.</h2><p><a href="/index2.html">Go back</a></p>');
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Questionnaire backend is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

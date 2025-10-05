const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve main form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve admin panel
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// ✅ Serve questions.json directly (used by fetchQuestions)
app.get('/data/questions.json', (req, res) => {
  const filePath = path.join(__dirname, 'data/questions.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Failed to load questions.json:', err);
      return res.status(500).send('Failed to load questions');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// 🛠️ Add a new question
app.post('/add-question', (req, res) => {
  const newQuestion = req.body;
  const filePath = path.join(__dirname, 'data/questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let questions = [];
    if (!err) {
      try {
        questions = JSON.parse(data);
      } catch (e) {
        console.error('⚠️ Corrupt questions.json, starting fresh');
      }
    }

    questions.push(newQuestion);

    fs.writeFile(filePath, JSON.stringify(questions, null, 2), err => {
      if (err) {
        console.error('❌ Failed to add question:', err);
        return res.status(500).send('Failed to save question');
      }
      res.sendStatus(200);
    });
  });
});

// 🛠️ Edit question text
app.put('/edit-question/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { text } = req.body;
  const filePath = path.join(__dirname, 'data/questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read questions');
    let questions = JSON.parse(data);
    if (!questions[index]) return res.status(404).send('Question not found');

    questions[index].question = text;

    fs.writeFile(filePath, JSON.stringify(questions, null, 2), err => {
      if (err) return res.status(500).send('Failed to update question');
      res.sendStatus(200);
    });
  });
});

// 🛠️ Edit question type
app.put('/edit-type/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { type } = req.body;
  const filePath = path.join(__dirname, 'data/questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read questions');
    let questions = JSON.parse(data);
    if (!questions[index]) return res.status(404).send('Question not found');

    questions[index].type = type;

    fs.writeFile(filePath, JSON.stringify(questions, null, 2), err => {
      if (err) return res.status(500).send('Failed to update type');
      res.sendStatus(200);
    });
  });
});

// 🗑️ Delete a question
app.delete('/delete-question/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const filePath = path.join(__dirname, 'data/questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Failed to read questions');
    let questions = JSON.parse(data);
    if (!questions[index]) return res.status(404).send('Question not found');

    questions.splice(index, 1);

    fs.writeFile(filePath, JSON.stringify(questions, null, 2), err => {
      if (err) return res.status(500).send('Failed to delete question');
      res.sendStatus(200);
    });
  });
});

// 📄 Load Agreement Text
app.get('/admin/agreement', (req, res) => {
  fs.readFile(path.join(__dirname, 'data/agreement.txt'), 'utf8', (err, text) => {
    if (err) {
      console.error('❌ Failed to read agreement.txt:', err);
      return res.status(500).send('Failed to load agreement');
    }
    res.send(text);
  });
});

// 💾 Save Agreement Text
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

// 📦 Get All Submissions
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
            submissions.push(JSON.parse(data));
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

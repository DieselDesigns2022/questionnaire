const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON (needed for GitHub webhooks)
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve views
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// Handle form submissions
app.post("/submit", (req, res) => {
  const submission = req.body;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(__dirname, "data", "submissions", `submission-${timestamp}.json`);

  fs.writeFile(filePath, JSON.stringify(submission, null, 2), (err) => {
    if (err) {
      console.error("Error saving submission:", err);
      return res.status(500).send("Failed to save submission.");
    }

    res.status(200).send("Submission received.");
  });
});

// ✅ GITHUB WEBHOOK: Auto-pull and restart app
app.post("/webhook", (req, res) => {
  exec("/root/questionnaire/pull.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("Webhook script error:", err);
      return res.status(500).send("Webhook error");
    }

    console.log("Webhook script output:", stdout);
    res.status(200).send("Webhook executed successfully.");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

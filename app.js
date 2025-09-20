const express = require("express");
const app = express();
const { exec } = require("child_process");
const path = require("path");

// Serve static files (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, ".")));
app.use(express.json());

// Admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// GitHub webhook endpoint
app.post("/webhook", (req, res) => {
  console.log("🔁 Webhook received: pulling latest code...");
  exec("git pull origin main && pm2 restart questionnaire", (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error:\n${stderr}`);
      return res.status(500).send("Webhook pull failed.");
    }
    console.log(`✅ Pulled and restarted:\n${stdout}`);
    res.status(200).send("Webhook executed.");
  });
});

// Start the server
app.listen(3000, () => {
  console.log("✅ Questionnaire server running on port 3000");
});

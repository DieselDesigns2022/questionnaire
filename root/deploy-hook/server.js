const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3001; // <- EXPLICITLY set to match GitHub webhook port

app.use(express.json());

app.post("/payload", (req, res) => {
  console.log("🔔 Webhook received");
  
  exec("sh /root/questionnaire/pull.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error pulling repo:", stderr);
      return res.status(500).send("Error pulling repo");
    }

    console.log("✅ Git pull successful:", stdout);
    res.status(200).send("Deployed!");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server is listening on port ${PORT}`);
});

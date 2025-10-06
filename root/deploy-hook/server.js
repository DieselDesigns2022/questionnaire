const express = require("express");
const { exec } = require("child_process");
const app = express();

const PORT = 3001;

app.use(express.json());

app.post("/payload", (req, res) => {
  console.log("🔔 Webhook POST /payload hit");
  console.log("📦 Payload received:", JSON.stringify(req.body, null, 2));

  exec("sh /root/questionnaire/pull.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Git pull failed:", stderr);
      return res.status(500).send("Git pull error");
    }

    console.log("✅ Git pull stdout:", stdout);
    res.status(200).send("Deployed successfully");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});

# questionnaire
# Questionnaire Site
## 🚀 Auto-Deploy Setup (VPS)

This project uses a GitHub webhook to auto-deploy to the VPS on every push to the `main` branch.

### ✅ Deployment Details

- **Live URL:** https://questionnaire.dieseldesigns.co
- **VPS Directory:** `/var/www/questionnaire.dieseldesigns.co`
- **Git Repo:** https://github.com/DieselDesigns2022/questionnaire
- **Webhook Endpoint:** `http://68.183.146.130:3001/payload`
- **Webhook Trigger:** GitHub push to `main` branch
- **Pull Action:** Runs `git pull origin main` on VPS

### 🧠 Auto-Deploy Process

- Lightweight Express server (`server.js`) runs on port `3001`
- Uses `pm2` to keep it running in the background
- `pm2` auto-starts on VPS reboot

### 🛠️ Commands (Reference)

```bash
# Restart deploy listener
pm2 restart deploy-hook

# View logs
pm2 logs deploy-hook

# Stop the deploy process
pm2 stop deploy-hook

# Save current pm2 process list (for reboot)
pm2 save

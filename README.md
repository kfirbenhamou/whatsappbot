# Daily WhatsApp AI Agent

Sends a personalised AI-generated good morning message to your wife every day via WhatsApp — runs free on GitHub Actions.

## How it works

1. **GitHub Actions** triggers the job daily at 08:00 (Israel time).
2. **Python agent** calls OpenAI `gpt-4o-mini` to generate a unique message.
3. **Node.js bridge** (`whatsapp-web.js`) loads your saved WhatsApp session and sends the message.

---

## Setup (one time)

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd whatsapp-agent
npm install
pip install -r requirements.txt
```

### 2. Authenticate with WhatsApp (local, one time)

```bash
npm run auth
```

- A QR code will appear in your terminal.
- Open WhatsApp on your phone → **Linked Devices** → **Link a Device** → scan the QR code.
- Wait for the "Client is ready!" message, then press **Ctrl+C**.

### 3. Export the session as a base64 secret

```bash
bash scripts/export_session.sh
```

This prints (and copies to clipboard) a base64 string — you'll need it in step 5.

### 4. Create a GitHub repository

Push this project to a new GitHub repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-agent.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 5. Add GitHub Secrets

Go to your repo on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these three secrets:

| Secret name | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key from [platform.openai.com](https://platform.openai.com) |
| `WIFE_PHONE` | Her number in WhatsApp format, e.g. `972501234567@c.us` (country code, no `+`) |
| `WA_SESSION_B64` | The base64 string from step 3 |

> **Phone format**: `972501234567@c.us` — Israel country code (972) + number without leading zero + `@c.us`

### 6. Test it manually

In your GitHub repo → **Actions** → **Daily WhatsApp Message** → **Run workflow**.

Check the logs to confirm the message was sent.

---

## Customising the message

Edit the system prompt in `agent/main.py` to personalise the tone, language, or style:

```python
"content": (
    "You write short, warm, creative daily WhatsApp messages from a husband to his wife. "
    ...
),
```

---

## Session expiry

WhatsApp sessions can expire after a few weeks or months. If the workflow fails with "Session expired", simply re-run `npm run auth` locally and repeat step 3 and 5 to update the `WA_SESSION_B64` secret.

---

## Cost

| Item | Cost |
|---|---|
| OpenAI gpt-4o-mini | ~$0.0001/message → ~$0.04/year |
| GitHub Actions | Free (uses ~2 min/day of the 2,000 free min/month) |
| **Total** | **~$0.04/year** |

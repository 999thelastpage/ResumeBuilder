# Deployment Guide

> This guide covers deploying CV Modernizer to a production environment. The app is designed as a self-hosted utility — the backend and frontend can be deployed independently.

---

## Pre-deployment Checklist

- [ ] Supabase project created and `schema.sql` has been run
- [ ] `GEMINI_API_KEY` confirmed working (test with `/api/health`)
- [ ] `SUPABASE_URL` and `SUPABASE_KEY` (service role) set
- [ ] CORS origins updated in `backend/main.py`
- [ ] `GEMINI_MODEL` set to a model available on your API key

## The "One-Click" VPS Setup (Docker)

The fastest and most reliable way to deploy to a fresh Linux VPS (Ubuntu/Debian) is using the included `deploy.sh` script. This handles:
- **Docker Auto-Install**: Automatically installs Docker and Docker Compose if missing.
- **IP Detection**: Automatically detects your Public IP for the Next.js build.
- **Domain Support**: Supports passing a domain name as an argument for SSL/Reverse Proxy setups.
- **Firewall Setup**: Automatically opens ports 3000 and 8000 via `ufw`.
- **Custom Branding**: Supports setting your own Ko-fi and UPI links via environment variables.

### 1. Simple IP-based Deploy
Use this if you just want to access the app via your VPS IP (e.g., `http://1.2.3.4:3000`).

1. SSH into your VPS.
2. Clone the repository and enter the directory.
3. Run the script:
   ```bash
   bash deploy.sh
   ```
4. *The first run will create a template `backend/.env` file and pause.* Edit `backend/.env` with your Gemini and Supabase keys.
5. Run `bash deploy.sh` again to finish.

### 2. Domain-based Deploy (Caddy/Nginx)
Use this if you have a domain pointing to your VPS and want to use SSL.

1. Run the script with your domain as the first argument:
   ```bash
   bash deploy.sh yourdomain.com
   ```
2. The script will automatically set `https://yourdomain.com` as the API and Frontend URLs.
3. Ensure your Caddy/Nginx config matches the domain (see Reverse Proxy section below).

### 3. UI Optimization
- **Mobile Ready**: The deployment includes a specialized view-switching system for mobile devices.
- **A4 Scaling**: The preview pane automatically scales the resume sheet to fit mobile screens while maintaining professional PDF proportions.

---

## Backend Deployment (FastAPI)

The backend is a standard ASGI app. Any Python hosting works.

### Option A — VPS / bare metal (recommended)

```bash
# Install dependencies
pip install -r requirements.txt

# Install Playwright browser dependencies (required for PDF export)
playwright install chromium

# Start with production settings (no --reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

# Or behind gunicorn
pip install gunicorn
gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 2
```

Use **nginx** as a reverse proxy with SSL termination:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 6M;   # slightly above MAX_FILE_BYTES
}
```

### Option B — Railway / Render / Fly.io

Add a `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

Set environment variables in the platform dashboard.

### Update CORS before deploying

In `backend/main.py`, replace the `allow_origins` list:
```python
allow_origins=[
    "https://your-production-domain.com",
    # remove localhost entries
]
```

---

## Frontend Deployment (Next.js)

### Option A — Vercel (recommended)

```bash
cd frontend
npx vercel --prod
```

Set the backend URL as an environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Then update the fetch URL in `Editor.tsx`:
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/extract`, { ... });
```

### Option B — Self-hosted

```bash
cd frontend
npm run build
npm start   # listens on port 3000
```

Use nginx to proxy port 80/443 → 3000.

---

## Supabase Maintenance

### Auto-cleanup old records

Run this in the Supabase SQL Editor or as a scheduled cron job:

```sql
DELETE FROM cv_cache
WHERE updated_at < NOW() - INTERVAL '7 days';
```

Or set up a [Supabase pg_cron job](https://supabase.com/docs/guides/database/extensions/pg_cron):

```sql
SELECT cron.schedule(
  'cleanup-cv-cache',
  '0 3 * * *',  -- runs daily at 03:00 UTC
  $$DELETE FROM cv_cache WHERE updated_at < NOW() - INTERVAL '7 days'$$
);
```

### Monitoring

```sql
-- Check cache size and recent activity
SELECT
  COUNT(*) as total_rows,
  MAX(updated_at) as most_recent_upload,
  MIN(created_at) as oldest_record
FROM cv_cache;
```

---

## Rate Limit Tuning

The app has dual-layer rate limiting:

1. **Email TTL Guard (Supabase):**
   Controlled by `TTL_HOURS` in `backend/main.py`. Default is 3 hours. Prevents a single valid user from spamming the Gemini API.
   ```python
   TTL_HOURS = 3
   ```

2. **IP-Based Rate Limiting (SlowAPI):**
   Protects against malicious bots bypassing the email guard. Controlled via `@limiter.limit` decorators in `backend/main.py`.
   - `/api/extract`: 10 requests / hour
   - `/api/export/pdf`: 20 requests / hour
   - `/api/export/docx`: 20 requests / hour

---

## File Size, Text & Page Limits

To prevent CPU exhaustion during text extraction:

```python
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB — reject at this threshold
MAX_TEXT_CHARS = 15_000            # ~3,000 words — truncate before Gemini call
```

Additionally, **PDFs are hard-capped at 5 pages**. If a user uploads a PDF with > 5 pages, it is instantly rejected before PyMuPDF attempts extraction.

---

## Playwright Concurrency Control (RAM Protection)

Headless Chromium processes are incredibly memory intensive (~200MB+ per request). To prevent Out-Of-Memory (OOM) crashes on smaller VPS machines (like 2GB RAM droplets), the PDF export route is protected by a standard `threading.Semaphore`.

```python
pdf_semaphore = threading.Semaphore(3)
```

This ensures only **3 concurrent PDF generation processes** run at any given time. Additional requests will block and wait up to 30 seconds before returning an HTTP 503 (Server Busy) error.

---

## Security Hardening

1. **Never expose `SUPABASE_KEY` (service role) to the frontend.** It is backend-only.
2. **Cloudflare Bot Fight Mode:** Put the deployed app behind Cloudflare to absorb basic DDoS and botnet sweeps.
3. **Restrict Supabase RLS** — the current policy (`USING (TRUE)`) allows the service role unrestricted access. For additional safety, you can scope policies to specific operations.

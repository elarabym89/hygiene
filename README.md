# Hygiene Coordination Tracker

A lightweight web app for hygiene outreach teams to log contact attempts and monitor same-day conversion metrics.

## What it tracks
- Patient name
- Contact date
- Outreach owner
- Channels used (text, email, voicemail, call)
- Appointment booked (yes/no)
- Outcome status
- Follow-up date
- Notes

## Daily metrics
The dashboard automatically calculates for today's entries:
- Total outreach attempts
- Number and percentage of people contacted
- Number of texts sent
- Number of emails sent
- Number of voicemails left
- Number of calls reached
- Number and percentage of appointments booked

## Exports
- **CSV export** (Excel-friendly)
- **JSON export** (for reporting pipelines or custom analytics)

## Run locally
Because this is a static app, use any local web server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
